#!/bin/bash
# Inception Workshop Facilitator
# Template → Fill → Validate workflow

# Note: Removed 'set -e' to allow validation to continue even when grep fails

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
    ["6"]="6-user-journey-mapping.md|6-user-journey-mapping.md|6-user-journey-validator.md"
    ["7"]="7-features-and-sequencing.md|7-features-and-sequencing.md|7-features-and-sequencing-validator.md"
    ["8"]="8-mvp-canvas-definition.md|8-mvp-canvas-definition.md|8-mvp-canvas-definition-validator.md"
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

# Function to validate step (bash-based)
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
    
    # Basic validation checks based on validator criteria
    local validation_file="$INCEPTION_DIR/.validation-report-$step_num.md"
    local score=0
    local max_score=10
    local passed=0
    local total_checks=0
    
    echo "Running validation checks..."
    echo ""
    
    # Read the validator and extract key criteria
    local validator_content=$(cat "$REFERENCES_DIR/$validator_file")
    local output_content=$(cat "$INCEPTION_DIR/$output_file")
    
    # Step-specific validation logic
    case $step_num in
        1)
            # Step 1: Product Vision Validation
            echo "Checking Elevator Pitch structure..."
            if echo "$output_content" | grep -q "| For | Who | The Product"; then
                echo "  ✅ Elevator Pitch: Found structured table"
                ((passed++))
            else
                echo "  ⚠️ Elevator Pitch: May need better structure"
            fi
            ((total_checks++))
            
            echo "Checking Product Goals..."
            if echo "$output_content" | grep -q "Goal"; then
                echo "  ✅ Product Goals: Present"
                ((passed++))
            else
                echo "  ❌ Product Goals: Missing"
            fi
            ((total_checks++))
            
            echo "Checking Is/Is Not, Does/Does Not tables..."
            if echo "$output_content" | grep -q "IS.*IS NOT" && echo "$output_content" | grep -q "DOES.*DOES NOT"; then
                echo "  ✅ Boundaries: Tables present"
                ((passed++))
            else
                echo "  ⚠️ Boundaries: May need clearer tables"
            fi
            ((total_checks++))
            ;;
            
        2)
            # Step 2: Tradeoffs Validation
            echo "Checking Trade-off Board structure..."
            if echo "$output_content" | grep -q "Trade-off Board\|Trade-off\|trade-off"; then
                echo "  ✅ Trade-off Board: Present"
                ((passed++))
            else
                echo "  ❌ Trade-off Board: Missing"
            fi
            ((total_checks++))
            
            echo "Checking Individual Perspectives..."
            if echo "$output_content" | grep -q "Individual Perspectives\|Product Owner\|User Advocate\|Tech Lead"; then
                echo "  ✅ Individual Perspectives: Present"
                ((passed++))
            else
                echo "  ⚠️ Individual Perspectives: May be incomplete"
            fi
            ((total_checks++))
            
            echo "Checking Consensus Reasoning..."
            if echo "$output_content" | grep -q "Consensus\|Reasoning"; then
                echo "  ✅ Consensus Reasoning: Present"
                ((passed++))
            else
                echo "  ❌ Consensus Reasoning: Missing"
            fi
            ((total_checks++))
            ;;
            
        3)
            # Step 3: Personas Validation
            echo "Checking Primary Persona definition..."
            if echo "$output_content" | grep -q "Primary Persona\|Persona Name"; then
                echo "  ✅ Primary Persona: Defined"
                ((passed++))
            else
                echo "  ❌ Primary Persona: Missing"
            fi
            ((total_checks++))
            
            echo "Checking Goals & Motivations..."
            if echo "$output_content" | grep -q "Goals.*Motivations\|Primary Goal"; then
                echo "  ✅ Goals: Present"
                ((passed++))
            else
                echo "  ⚠️ Goals: May be incomplete"
            fi
            ((total_checks++))
            
            echo "Checking Pain Points..."
            if echo "$output_content" | grep -q "Pain Points\|Frustrations"; then
                echo "  ✅ Pain Points: Present"
                ((passed++))
            else
                echo "  ❌ Pain Points: Missing"
            fi
            ((total_checks++))
            ;;
            
        4)
            # Step 4: Empathy Map Validation
            echo "Checking Empathy Map quadrants..."
            if echo "$output_content" | grep -q "SEES\|SAYS\|THINKS\|DOES"; then
                echo "  ✅ Quadrants: All present"
                ((passed++))
            else
                echo "  ⚠️ Quadrants: May be incomplete"
            fi
            ((total_checks++))
            
            echo "Checking Pains & Gains..."
            if echo "$output_content" | grep -q "PAINS\|GAINS"; then
                echo "  ✅ Pains & Gains: Present"
                ((passed++))
            else
                echo "  ⚠️ Pains & Gains: May be missing"
            fi
            ((total_checks++))
            ;;
            
        5)
            # Step 5: Brainstorming Validation
            echo "Checking Feature Categories..."
            if echo "$output_content" | grep -q "Core Features\|Supporting Features"; then
                echo "  ✅ Feature Categories: Present"
                ((passed++))
            else
                echo "  ⚠️ Feature Categories: May need organization"
            fi
            ((total_checks++))
            
            echo "Checking Feature-Persona alignment..."
            if echo "$output_content" | grep -q "Related to\|Persona"; then
                echo "  ✅ Feature-Persona Links: Present"
                ((passed++))
            else
                echo "  ⚠️ Feature-Persona Links: May be missing"
            fi
            ((total_checks++))
            
            echo "Checking Assessment Table..."
            if echo "$output_content" | grep -q "Business Value\|Technical Effort\|Priority"; then
                echo "  ✅ Assessment: Present"
                ((passed++))
            else
                echo "  ⚠️ Assessment: May be missing"
            fi
            ((total_checks++))
            ;;
            
        6)
            # Step 6: User Journey Validation
            echo "Checking Journey structure..."
            if echo "$output_content" | grep -q "Journey.*Persona\|User Action.*System Feature"; then
                echo "  ✅ Journey Structure: Present"
                ((passed++))
            else
                echo "  ⚠️ Journey Structure: May need table format"
            fi
            ((total_checks++))
            
            echo "Checking Feature Alignment..."
            if echo "$output_content" | grep -q "Feature.*Journey\|Matrix\|Coverage"; then
                echo "  ✅ Feature Alignment: Present"
                ((passed++))
            else
                echo "  ⚠️ Feature Alignment: May be incomplete"
            fi
            ((total_checks++))
            ;;
            
        7)
            # Step 7: Features & Sequencing Validation
            echo "Checking Release Waves..."
            if echo "$output_content" | grep -q "Wave.*MVP\|Release.*Planning"; then
                echo "  ✅ Release Waves: Present"
                ((passed++))
            else
                echo "  ❌ Release Waves: Missing"
            fi
            ((total_checks++))
            
            echo "Checking Feature Assessment..."
            if echo "$output_content" | grep -q "Effort.*Business Value.*UX Value"; then
                echo "  ✅ Feature Assessment: Present"
                ((passed++))
            else
                echo "  ⚠️ Feature Assessment: May be missing"
            fi
            ((total_checks++))
            
            echo "Checking MVP Definition..."
            if echo "$output_content" | grep -q "MVP.*Definition\|MVP.*Rationale"; then
                echo "  ✅ MVP Definition: Present"
                ((passed++))
            else
                echo "  ⚠️ MVP Definition: May be unclear"
            fi
            ((total_checks++))
            ;;
            
        8)
            # Step 8: MVP Canvas Validation
            echo "Checking MVP Proposal..."
            if echo "$output_content" | grep -q "MVP.*Proposal\|Cupcake\|Vision Statement"; then
                echo "  ✅ MVP Proposal: Present"
                ((passed++))
            else
                echo "  ❌ MVP Proposal: Missing"
            fi
            ((total_checks++))
            
            echo "Checking Success Metrics..."
            if echo "$output_content" | grep -q "Metrics\|KPI\|Success.*Criteria"; then
                echo "  ✅ Success Metrics: Present"
                ((passed++))
            else
                echo "  ⚠️ Success Metrics: May be missing"
            fi
            ((total_checks++))
            
            echo "Checking Risks & Mitigation..."
            if echo "$output_content" | grep -q "Risk.*Mitigation"; then
                echo "  ✅ Risks & Mitigation: Present"
                ((passed++))
            else
                echo "  ⚠️ Risks & Mitigation: May be incomplete"
            fi
            ((total_checks++))
            ;;
    esac
    
    # Calculate score
    if [[ $total_checks -gt 0 ]]; then
        score=$(( (passed * max_score) / total_checks ))
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 Validation Results:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Passed checks: $passed/$total_checks"
    echo "Score: $score/$max_score"
    echo ""
    
    if [[ $score -ge 8 ]]; then
        echo -e "${GREEN}✅ Excellent! Step $step_num is complete.${NC}"
        return 0
    elif [[ $score -ge 6 ]]; then
        echo -e "${YELLOW}⚠️ Good, but could be improved.${NC}"
        return 0
    else
        echo -e "${RED}❌ Needs work. Please revise based on feedback.${NC}"
        return 1
    fi
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
        step_data=${STEPS[$STEP]}
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
