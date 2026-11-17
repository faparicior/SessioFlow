# SessioFlow Unsloth Dataset Generator

Generates verified `messages`-format JSONL datasets (`train.jsonl` and `eval.jsonl`) for fine-tuning **Qwen 3.5 4B** with **Unsloth** on SessioFlow's DDD folder structure, coding conventions, and architecture test invariants.

## Generate Dataset

```bash
# Fast generation (no oracle run)
node scripts/dataset/generate-dataset.mjs

# Oracle-verified generation (runs scripts/check-architecture.mjs on every synthetic module)
node scripts/dataset/generate-dataset.mjs --verify

# Parallel thinking-aligned dataset (writes <think>...</think> traces to scripts/dataset/out-thinking/)
node scripts/dataset/generate-dataset.mjs --thinking --verify

# Distill real <think> + code from Unsloth Studio's local OpenAI-compatible API (filtered by check-architecture.mjs)
node scripts/dataset/generate-dataset.mjs --teacher-url http://localhost:8080/v1 --teacher-limit 20
```

Outputs:
- `scripts/dataset/out/train.jsonl` & `eval.jsonl` — direct coder dataset (for inference with thinking OFF)
- `scripts/dataset/out-thinking/train.jsonl` & `eval.jsonl` — thinking-aligned dataset (for inference with thinking ON)
- `scripts/dataset/out-tinking-teacher/train.jsonl` & `eval.jsonl` — distilled & oracle-filtered dataset from your teacher API (`--teacher-model`, `--teacher-key` optional)

## Train with Unsloth (Qwen 3.5 4B)

```python
from datasets import load_dataset
from unsloth import FastLanguageModel
from unsloth.chat_templates import get_chat_template
from trl import SFTConfig, SFTTrainer

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/Qwen3.5-4B-Instruct",  # or your local Qwen 3.5 4B checkpoint
    max_seq_length=4096,
    load_in_4bit=True,
)

model = FastLanguageModel.get_peft_model(
    model,
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    lora_dropout=0,
    bias="none",
)

dataset = load_dataset(
    "json",
    data_files={
        "train": "scripts/dataset/out/train.jsonl",
        "eval": "scripts/dataset/out/eval.jsonl",
    },
)

def format_chat(examples):
    texts = [
        tokenizer.apply_chat_template(msgs, tokenize=False, add_generation_prompt=False)
        for msgs in examples["messages"]
    ]
    return {"text": texts}

dataset = dataset.map(format_chat, batched=True)

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset["train"],
    eval_dataset=dataset["eval"],
    dataset_text_field="text",
    max_seq_length=4096,
    args=SFTConfig(
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        num_train_epochs=3,
        learning_rate=2e-4,
        logging_steps=5,
        output_dir="outputs/qwen35-4b-sessioflow",
    ),
)
trainer.train()
```

## Scaling Up the Dataset

To expand from the built-in seed generator (~60+ verified samples) to 1,000–3,000 samples:
1. Add more domains and use cases (queries, aggregate roots, Drizzle repositories, unit tests) to `TRAIN_DOMAINS` or drive them via an LLM teacher loop.
2. Keep `--verify` enabled so every generated sample must pass `scripts/check-architecture.mjs` (and optionally `npx vitest run tests/unit/architecture`) before entering `train.jsonl`.

