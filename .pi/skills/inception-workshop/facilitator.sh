#!/bin/bash
# Inception Workshop Facilitator
# Template → Fill → Validate workflow

set -e

# Configuration
# Paths are relative to the skill directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATES_DIR="$SCRIPT_DIR/templates"
REFERENCES_DIR="$SCRIPT_DIR/references"
INCEPTION_DIR="docs/inception"

# Step definitions
declare -A STEPS=(
    ["1"]="1-product-vision-and-boundaries.md|1-product-vision-and-boundaries.md|1-product-vision-boundary-validator.md"
    ["2"]="2-tradeoffs.md|2-tradeoffs.md|2.2-tradeoff-validator.md"
    ["3"]="3-personas.md|3-personas.md|3-personas-validator.md"
    ["4"]="4-empathy-map.md|4-empathy-map.md|4-empathy-map-validator.md"
    ["5"]="5-brainstorming.md|5-brainstorming.md|5-brainstorming-validator.md"
    ["6"]="6-user-journey-mapping.md|6-user-journey.md|6-user-journey-validator.md"
    ["7"]="7-features-and-sequencing.md|7-features-and-sequencing.md|7-features-and-sequencing-validator.md"
    ["8"]="8-mvp-canvas-definition.md|8-mvp-canvas.md|8-mvp-canvas-definition-validator.md"
)

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Create output directory
mkdir -p "$INCEPTION_DIR"

# Function to display step information
display_step() {
    local step_num=$1
    local template_file=$2
    
    echo ""
    echo "========================================"
    echo "  Step $step_num: $(basename $template_file | sed 's/[0-9]-//; s/-/ /g; s/.md//; s/\b\(.\)/\u\1/g')"
    echo "========================================"
    echo ""
    
    # Read and display template structure
    if [[ -f "$TEMPLATES_DIR/$template_file" ]]; then
        echo "📄 Template Structure:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        head -50 "$TEMPLATES_DIR/$template_file"
        echo "..."
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
    else
        log_error "Template not found: $TEMPLATES_DIR/$template_file"
        exit 1
    fi
}

# Function to create output file
create_output_file() {
    local template_file=$1
    local output_file=$2
    
    if [[ -f "$TEMPLATES_DIR/$template_file" ]]; then
        cp "$TEMPLATES_DIR/$template_file" "$INCEPTION_DIR/$output_file"
        log_info "Created: $INCEPTION_DIR/$output_file"
    else
        log_error "Template not found: $TEMPLATES_DIR/$template_file"
        exit 1
    fi
}

# Function to validate step
validate_step() {
    local step_num=$1
    local output_file=$2
    local validator_file=$3
    
    echo ""
    echo "🔍 Validating Step $step_num..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [[ ! -f "$INCEPTION_DIR/$output_file" ]]; then
        log_error "Output file not found: $INCEPTION_DIR/$output_file"
        echo "Please fill the document and commit it first."
        return 1
    fi
    
    if [[ ! -f "$REFERENCES_DIR/$validator_file" ]]; then
        log_warn "Validator not found: $REFERENCES_DIR/$validator_file"
        echo "Skipping validation (no validator defined)"
        return 0
    fi
    
    # Read validator criteria
    echo "Validator: $REFERENCES_DIR/$validator_file"
    echo ""
    
    # Use pi subagent to validate
    pi subagent << EOF
Read the completed document at: $INCEPTION_DIR/$output_file
Read the validator criteria at: $VALIDATORS_DIR/$validator_file

Evaluate the document against each validation criterion and provide:
1. ✅ Passed criteria
2. ⚠️ Partially met criteria
3. ❌ Failed criteria
4. Overall score (0-10)
5. Specific recommendations for improvement

Format your response as a validation report.
EOF
    
    return $?
}

# Main facilitation loop
facilitate_step() {
    local step_num=$1
    local step_data=${STEPS[$step_num]}
    
    IFS='|' read -r template_file output_file validator_file <<< "$step_data"
    
    echo ""
    echo "🚀 Starting Step $step_num..."
    
    # Phase 1: Display template
    display_step "$step_num" "$template_file"
    
    # Phase 2: Create output file
    create_output_file "$template_file" "$output_file"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📝 YOUR TURN"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Please fill the document at:"
    echo "  $INCEPTION_DIR/$output_file"
    echo ""
    echo "When you're ready for validation, type:"
    echo "  ready"
    echo ""
    echo "Or type 'skip' to move to next step without validation"
    echo "Or type 'quit' to exit the workshop"
    echo ""
    
    # Wait for user input
    while true; do
        read -p "> " user_input
        
        case "$user_input" in
            ready|Ready|READY)
                # Phase 3: Validate
                if validate_step "$step_num" "$output_file" "$validator_file"; then
                    log_info "Step $step_num validation complete!"
                    
                    if [[ $step_num -lt 8 ]]; then
                        read -p "Ready to proceed to Step $((step_num + 1))? (yes/no) " proceed
                        if [[ "$proceed" =~ ^[Yy] ]]; then
                            facilitate_step $((step_num + 1))
                            break
                        else
                            echo "Workshop paused. You can resume with: pi skill inception-workshop --step $step_num"
                            break
                        fi
                    else
                        log_info "🎉 Workshop Complete! All 8 steps finished."
                        break
                    fi
                else
                    log_warn "Validation failed. Please revise and try again."
                fi
                ;;
            skip|Skip|SKIP)
                log_warn "Skipping Step $step_num"
                if [[ $step_num -lt 8 ]]; then
                    read -p "Proceed to Step $((step_num + 1))? (yes/no) " proceed
                    if [[ "$proceed" =~ ^[Yy] ]]; then
                        facilitate_step $((step_num + 1))
                        break
                    else
                        break
                    fi
                fi
                ;;
            quit|Quit|QUIT|exit|Exit|EXIT)
                echo "Workshop exited. Resume with: pi skill inception-workshop --step $step_num"
                break
                ;;
            *)
                echo "Unknown command. Type 'ready', 'skip', or 'quit'"
                ;;
        esac
    done
}

# Batch mode
batch_mode() {
    local context=$1
    
    echo ""
    echo "🤖 Batch Mode: Generating all 8 steps..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    for step_num in {1..8}; do
        local step_data=${STEPS[$step_num]}
        IFS='|' read -r template_file output_file validator_file <<< "$step_data"
        
        echo "Step $step_num: $(basename $output_file)..."
        
        # Create output file from template
        create_output_file "$template_file" "$output_file"
        
        # Generate content using pi subagent
        pi subagent << EOF
Generate content for Step $step_num: $(basename $output_file .md | sed 's/[0-9]-//; s/-/ /g')

Context: $context

Read the template at: $TEMPLATES_DIR/$template_file
Generate complete content following the template structure.
Write to: $INCEPTION_DIR/$output_file

Be comprehensive and specific.
EOF
        
        echo -e "${GREEN}✓${NC} Completed Step $step_num"
        echo ""
    done
    
    log_info "🎉 All 8 steps generated successfully!"
    echo ""
    echo "Files created in: $INCEPTION_DIR/"
}

# Validate mode
validate_mode() {
    local step_num=$1
    local output_file=$2
    
    local step_data=${STEPS[$step_num]}
    IFS='|' read -r template_file _ validator_file <<< "$step_data"
    
    validate_step "$step_num" "$output_file" "$validator_file"
}

# Parse command line arguments
MODE="${1:-facilitate}"
STEP="${2:-1}"
CONTEXT="${3:-}"

case "$MODE" in
    facilitate|f)
        facilitate_step "$STEP"
        ;;
    batch|b)
        if [[ -z "$CONTEXT" ]]; then
            log_error "Batch mode requires context: --context \"Your product description\""
            exit 1
        fi
        batch_mode "$CONTEXT"
        ;;
    tradeoff|t|tradeoff-generator)
        echo ""
        echo "🤖 Tradeoff Generator Mode (Step 2)"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        
        # Check if Step 1 is complete
        if [[ ! -f "$INCEPTION_DIR/1-product-vision-and-boundaries.md" ]]; then
            log_error "Step 1 must be completed first!"
            echo "Please complete Step 1: Product Vision & Boundaries"
            echo "Run: $0 facilitate 1"
            exit 1
        fi
        
        # Run AI debate simulation
        pi subagent << EOF
You are an expert Lean Inception Facilitator. Generate a Trade-off Board by simulating stakeholder debate.

Read these files:
1. Product Vision: $INCEPTION_DIR/1-product-vision-and-boundaries.md
2. Template: $TEMPLATES_DIR/2-tradeoffs.md
3. Validator: $REFERENCES_DIR/2.2-tradeoff-validator.md
4. Generator Instructions: $REFERENCES_DIR/2.1-tradeoff-generator.md

Simulate debate between:
- Product Owner (business goals from vision)
- User Advocate (user needs from vision)
- Tech Lead (technical constraints from vision)
- Agile Coach (enforces Golden Rule)

Generate consensus tradeoff board with:
1. Individual Perspectives section
2. Final Consensus Trade-off Board (strict 1-7 ranking)
3. Consensus Reasoning

Output to: docs/inception/2-tradeoffs.md
EOF
        
        log_info "Tradeoff analysis complete!"
        echo ""
        echo "Generated: $INCEPTION_DIR/2-tradeoffs.md"
        echo ""
        echo "Would you like to validate this? (yes/no)"
        read validate_response
        if [[ "$validate_response" =~ ^[Yy] ]]; then
            validate_step 2 "2-tradeoffs.md" "2.2-tradeoff-validator.md"
        fi
        ;;
    validate|v)
        if [[ -z "$STEP" ]]; then
            log_error "Validate mode requires step number: --step N"
            exit 1
        fi
        local step_data=${STEPS[$STEP]}
        IFS='|' read -r _ output_file validator_file <<< "$step_data"
        validate_step "$STEP" "$output_file" "$validator_file"
        ;;
    *)
        echo "Usage: $0 [mode] [step] [context]"
        echo ""
        echo "Modes:"
        echo "  facilitate (default)     - Interactive template→fill→validate"
        echo "  tradeoff, t              - AI debate simulation for Step 2"
        echo "  batch, b                 - Generate all steps automatically"
        echo "  validate, v              - Validate a specific step"
        echo ""
        echo "Examples:"
        echo "  $0 facilitate 1              # Start from Step 1"
        echo "  $0 facilitate 6              # Start from Step 6"
        echo "  $0 tradeoff                  # Generate tradeoffs using AI debate"
        echo "  $0 batch \"Product context\"   # Generate all steps"
        echo "  $0 validate 1                # Validate Step 1"
        exit 1
        ;;
esac
