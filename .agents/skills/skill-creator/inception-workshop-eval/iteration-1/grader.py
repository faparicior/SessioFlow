#!/usr/bin/env python3
"""
Grader for Inception Workshop Skill Evaluation
Evaluates outputs against assertions
"""

import json
import os
import re
from pathlib import Path

def count_occurrences(content, phrases):
    """Count how many phrases are found in content"""
    return sum(1 for phrase in phrases if phrase.lower() in content.lower())

def validate_golden_rule(content):
    """Validate strict 1-7 ranking with one item per column"""
    # Look for tradeoff board pattern
    pattern = r'\|.*?\|.*?\|.*?\|.*?\|.*?\|.*?\|.*?\|.*?\|'
    matches = re.findall(pattern, content)
    
    if not matches:
        return False, "No tradeoff board found"
    
    # Check for X marks - should be exactly 7 X's (one per column)
    x_count = content.count('X')
    if x_count != 7:
        return False, f"Expected 7 X marks (one per column), found {x_count}"
    
    return True, "Golden rule validated: one check per column"

def count_files(directory, pattern="*.md"):
    """Count markdown files in directory"""
    path = Path(directory)
    return len(list(path.glob(pattern)))

def grade_eval_001_with_skill():
    """Grade eval-001 with-skill output"""
    output_file = "iteration-1/eval-001-with-skill/outputs/product-vision.md"
    
    with open(output_file, 'r') as f:
        content = f.read()
    
    results = []
    
    # Assertion 1: Completeness - all 5 elevator pitch components
    required = ["For", "Who", "The Product", "Is a", "That", "Unlike", "Our Product"]
    found = count_occurrences(content, required)
    passed = found >= 7
    results.append({
        "text": "Elevator pitch completeness",
        "passed": passed,
        "evidence": f"Found {found}/7 required components"
    })
    
    # Assertion 2: Boundaries
    boundary_terms = ["The Product IS", "The Product IS NOT", "The Product DOES", "The Product DOES NOT"]
    found = count_occurrences(content, boundary_terms)
    passed = found >= 4
    results.append({
        "text": "Clear boundaries defined",
        "passed": passed,
        "evidence": f"Found {found}/4 boundary definitions"
    })
    
    # Assertion 3: At least 3 goals
    goal_pattern = r'Goal \d+'
    goals = re.findall(goal_pattern, content)
    passed = len(goals) >= 3
    results.append({
        "text": "Measurable goals defined",
        "passed": passed,
        "evidence": f"Found {len(goals)} goals"
    })
    
    return results

def grade_eval_002_with_skill():
    """Grade eval-002 with-skill output"""
    output_dir = "iteration-1/eval-002-with-skill/outputs"
    
    results = []
    
    # Assertion 1: All 8 steps generated
    file_count = count_files(output_dir, "*.md")
    passed = file_count >= 8
    results.append({
        "text": "All 8 inception steps generated",
        "passed": passed,
        "evidence": f"Found {file_count} files"
    })
    
    # Assertion 2: Consistency check
    files = sorted(Path(output_dir).glob("*.md"))
    all_content = ""
    for f in files:
        with open(f, 'r') as file:
            all_content += file.read()
    
    # Check for consistent product name
    mentions = all_content.lower().count("sessioflow")
    passed = mentions >= 10  # Should mention product name multiple times
    results.append({
        "text": "Consistent product naming across steps",
        "passed": passed,
        "evidence": f"SessioFlow mentioned {mentions} times across all documents"
    })
    
    return results

def grade_eval_003_with_skill():
    """Grade eval-003 with-skill output"""
    output_file = "iteration-1/eval-003-with-skill/outputs/tradeoffs.md"
    
    with open(output_file, 'r') as f:
        content = f.read()
    
    results = []
    
    # Assertion 1: At least 3 stakeholder perspectives
    perspectives = ["Product Owner", "UX", "Tech Lead", "Agile Coach"]
    found = sum(1 for p in perspectives if p.lower() in content.lower())
    passed = found >= 3
    results.append({
        "text": "Multiple stakeholder perspectives",
        "passed": passed,
        "evidence": f"Found {found}/4 stakeholder perspectives"
    })
    
    # Assertion 2: Golden rule validation
    passed, message = validate_golden_rule(content)
    results.append({
        "text": "Strict 1-7 ranking (golden rule)",
        "passed": passed,
        "evidence": message
    })
    
    # Assertion 3: Consensus reasoning
    reasoning_terms = ["consensus", "trade-off", "agreed", "reasoning"]
    found = count_occurrences(content, reasoning_terms)
    passed = found >= 3
    results.append({
        "text": "Consensus reasoning provided",
        "passed": passed,
        "evidence": f"Found {found}/3 reasoning indicators"
    })
    
    return results

def grade_baseline_outputs():
    """Grade baseline outputs (without skill)"""
    results = {}
    
    # Eval 001 baseline
    try:
        with open("iteration-1/eval-001-baseline/outputs/product-vision.md", 'r') as f:
            content = f.read()
        
        baseline_results = []
        required = ["For", "Who", "The Product", "Is a", "That", "Unlike", "Our Product"]
        found = count_occurrences(content, required)
        baseline_results.append({
            "text": "Elevator pitch completeness",
            "passed": found >= 7,
            "evidence": f"Found {found}/7 required components"
        })
        
        results["eval-001-baseline"] = baseline_results
    except FileNotFoundError:
        results["eval-001-baseline"] = [{"text": "File not found", "passed": False, "evidence": ""}]
    
    return results

def main():
    print("=" * 60)
    print("INCEPTION WORKSHOP SKILL EVALUATION - GRADING RESULTS")
    print("=" * 60)
    print()
    
    # Grade with-skill outputs
    print("EVAL-001 (Product Vision Facilitation) - WITH SKILL")
    print("-" * 60)
    eval001_results = grade_eval_001_with_skill()
    for r in eval001_results:
        status = "✅ PASS" if r["passed"] else "❌ FAIL"
        print(f"  {status}: {r['text']}")
        print(f"         {r['evidence']}")
    print()
    
    print("EVAL-002 (Batch Generation) - WITH SKILL")
    print("-" * 60)
    eval002_results = grade_eval_002_with_skill()
    for r in eval002_results:
        status = "✅ PASS" if r["passed"] else "❌ FAIL"
        print(f"  {status}: {r['text']}")
        print(f"         {r['evidence']}")
    print()
    
    print("EVAL-003 (Tradeoff Analysis) - WITH SKILL")
    print("-" * 60)
    eval003_results = grade_eval_003_with_skill()
    for r in eval003_results:
        status = "✅ PASS" if r["passed"] else "❌ FAIL"
        print(f"  {status}: {r['text']}")
        print(f"         {r['evidence']}")
    print()
    
    # Summary
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    total_assertions = len(eval001_results) + len(eval002_results) + len(eval003_results)
    passed_assertions = sum(1 for r in eval001_results + eval002_results + eval003_results if r["passed"])
    pass_rate = (passed_assertions / total_assertions) * 100
    
    print(f"Total assertions: {total_assertions}")
    print(f"Passed: {passed_assertions}")
    print(f"Failed: {total_assertions - passed_assertions}")
    print(f"Pass rate: {pass_rate:.1f}%")
    print()
    
    # Save grading results
    grading = {
        "eval-001-with-skill": eval001_results,
        "eval-002-with-skill": eval002_results,
        "eval-003-with-skill": eval003_results
    }
    
    with open("iteration-1/grading.json", 'w') as f:
        json.dump(grading, f, indent=2)
    
    print("Grading results saved to iteration-1/grading.json")

if __name__ == "__main__":
    main()
