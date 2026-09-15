#!/usr/bin/env python3
"""
Grader for Inception Workshop Skill Evaluation - Iteration 4
Evaluates 10 test cases with comprehensive assertions
"""

import json
import os
import re
from pathlib import Path

def count_occurrences(content, phrases):
    """Count how many phrases are found in content"""
    return sum(1 for phrase in phrases if phrase.lower() in content.lower())

def count_occurrences_exact(content, phrases):
    """Count exact phrase matches (case-insensitive)"""
    count = 0
    for phrase in phrases:
        if re.search(re.escape(phrase), content, re.IGNORECASE):
            count += 1
    return count

def count_files(directory, pattern="*.md"):
    """Count markdown files in directory"""
    path = Path(directory)
    return len(list(path.glob(pattern)))

def validate_golden_rule(content):
    """Validate strict 1-7 ranking with one item per column"""
    lines = content.split('\n')
    x_count = 0
    for line in lines:
        if line.strip().startswith('|') and '|' in line:
            matches = re.findall(r'\|\s*X\s*\|', line)
            x_count += len(matches)
    if x_count != 7:
        return False, f"Expected 7 X marks, found {x_count}"
    return True, "Golden rule validated"

def check_product_name_consistency(content, product_name):
    """Check if product name is used in title and has reasonable mentions"""
    has_in_title = bool(re.search(r'^#.*' + re.escape(product_name), content, re.IGNORECASE | re.MULTILINE))
    total_mentions = len(re.findall(re.escape(product_name), content, re.IGNORECASE))
    passes = has_in_title and total_mentions >= 1
    return passes, {"in_title": has_in_title, "mentions": total_mentions}

# Grading functions for each eval
def grade_eval_001():
    """Product Vision Facilitation"""
    content = open("iteration-4/eval-001-with-skill/outputs/product-vision.md").read()
    results = []
    required = ["For", "Who", "The Product", "Is a", "That", "Unlike", "Our Product"]
    found = count_occurrences(content, required)
    results.append({"text": "Elevator pitch completeness", "passed": found >= 7, "evidence": f"Found {found}/7"})
    boundary_terms = ["The Product **IS**", "The Product **IS NOT**", "The Product **DOES**", "The Product **DOES NOT**"]
    found = count_occurrences_exact(content, boundary_terms)
    results.append({"text": "Clear boundaries defined", "passed": found >= 4, "evidence": f"Found {found}/4"})
    goals = re.findall(r'Goal \d+', content)
    results.append({"text": "Measurable goals defined", "passed": len(goals) >= 3, "evidence": f"Found {len(goals)} goals"})
    return results

def grade_eval_002():
    """Batch Generation"""
    output_dir = "iteration-4/eval-002-with-skill/outputs"
    results = []
    file_count = count_files(output_dir, "*.md")
    results.append({"text": "All 8 inception steps generated", "passed": file_count >= 8, "evidence": f"Found {file_count} files"})
    files = sorted(Path(output_dir).glob("*.md"))
    all_content = "".join(open(f).read() for f in files)
    mentions = all_content.lower().count("sessioflow")
    results.append({"text": "Consistent product naming", "passed": mentions >= 15, "evidence": f"SessioFlow mentioned {mentions} times"})
    return results

def grade_eval_003():
    """Tradeoff Analysis"""
    content = open("iteration-4/eval-003-with-skill/outputs/tradeoffs.md").read()
    results = []
    perspectives = ["Product Owner", "UX", "Tech Lead", "Agile Coach"]
    found = sum(1 for p in perspectives if p.lower() in content.lower())
    results.append({"text": "Multiple stakeholder perspectives", "passed": found >= 3, "evidence": f"Found {found}/4"})
    passed, message = validate_golden_rule(content)
    results.append({"text": "Strict 1-7 ranking (golden rule)", "passed": passed, "evidence": message})
    reasoning_terms = ["consensus", "trade-off", "agreed", "reasoning"]
    found = count_occurrences(content, reasoning_terms)
    results.append({"text": "Consensus reasoning provided", "passed": found >= 3, "evidence": f"Found {found}/3"})
    return results

def grade_eval_004():
    """Personas - QuickBite"""
    content = open("iteration-4/eval-004-with-skill/outputs/personas.md").read()
    results = []
    # Check for at least 3 personas
    persona_count = len(re.findall(r'## (Primary|Secondary|Tertiary) Persona:', content))
    results.append({"text": "At least 3 personas created", "passed": persona_count >= 3, "evidence": f"Found {persona_count} personas"})
    # Check for completeness
    required_sections = ["Profile", "Goals", "Frustrations", "Behavior Patterns", "Quote"]
    found = count_occurrences_exact(content, required_sections)
    results.append({"text": "Persona completeness", "passed": found >= 5, "evidence": f"Found {found}/5 sections"})
    # Check product name
    passed, info = check_product_name_consistency(content, "QuickBite")
    results.append({"text": "Product name consistency", "passed": passed, "evidence": f"QuickBite found {info['mentions']} times"})
    return results

def grade_eval_005():
    """User Journey - HealthConnect"""
    content = open("iteration-4/eval-005-with-skill/outputs/user-journey.md").read()
    results = []
    # Check for at least 2 journeys
    journey_count = len(re.findall(r'## Journey \d+:', content))
    results.append({"text": "At least 2 user journeys", "passed": journey_count >= 2, "evidence": f"Found {journey_count} journeys"})
    # Check journey completeness
    required = ["Actions", "Thoughts", "Feelings", "Opportunities"]
    found = count_occurrences_exact(content, required)
    results.append({"text": "Journey completeness", "passed": found >= 4, "evidence": f"Found {found}/4 sections"})
    # Check product name
    passed, info = check_product_name_consistency(content, "HealthConnect")
    results.append({"text": "Product name consistency", "passed": passed, "evidence": f"HealthConnect found {info['mentions']} times"})
    return results

def grade_eval_006():
    """Empathy Map - HomeHub"""
    content = open("iteration-4/eval-006-with-skill/outputs/empathy-map.md").read()
    results = []
    # Check for all 4 quadrants
    quadrants = ["SAYS", "THINKS", "DOES", "FEELS"]
    found = count_occurrences_exact(content, quadrants)
    results.append({"text": "All 4 empathy quadrants", "passed": found >= 4, "evidence": f"Found {found}/4 quadrants"})
    # Check for elderly focus
    elderly_terms = ["accessibility", "difficulty", "confusing", "help", "elderly", "senior"]
    found = count_occurrences(content, elderly_terms)
    results.append({"text": "Elderly user focus", "passed": found >= 3, "evidence": f"Found {found} elderly-related terms"})
    # Check product name
    passed, info = check_product_name_consistency(content, "HomeHub")
    results.append({"text": "Product name consistency", "passed": passed, "evidence": f"HomeHub found {info['mentions']} times"})
    return results

def grade_eval_007():
    """Features & Sequencing - PayEasy"""
    content = open("iteration-4/eval-007-with-skill/outputs/features-sequencing.md").read()
    results = []
    # Check for phased plan
    phases = re.findall(r'Phase \d+:', content)
    results.append({"text": "Phased release plan", "passed": len(phases) >= 3, "evidence": f"Found {len(phases)} phases"})
    # Check for prioritization
    priority_terms = ["Priority", "P0", "P1", "P2", "Must", "Should"]
    found = count_occurrences_exact(content, priority_terms)
    results.append({"text": "Feature prioritization", "passed": found >= 2, "evidence": f"Found {found} priority indicators"})
    # Check product name
    passed, info = check_product_name_consistency(content, "PayEasy")
    results.append({"text": "Product name consistency", "passed": passed, "evidence": f"PayEasy found {info['mentions']} times"})
    return results

def grade_eval_008():
    """MVP Canvas - SkillUp"""
    content = open("iteration-4/eval-008-with-skill/outputs/mvp-canvas.md").read()
    results = []
    # Check for MVP components
    components = ["Problem", "Solution", "MVP", "Metrics", "Assumptions", "Risks"]
    found = count_occurrences_exact(content, components)
    results.append({"text": "MVP components included", "passed": found >= 6, "evidence": f"Found {found}/6 components"})
    # Check for launch criteria
    launch_terms = ["Launch", "Criteria", "Checklist", "Ready"]
    found = count_occurrences(content, launch_terms)
    results.append({"text": "Launch criteria included", "passed": found >= 2, "evidence": f"Found {found} launch indicators"})
    # Check product name
    passed, info = check_product_name_consistency(content, "SkillUp")
    results.append({"text": "Product name consistency", "passed": passed, "evidence": f"SkillUp found {info['mentions']} times"})
    return results

def grade_eval_009():
    """Product Vision - EcoTrack"""
    content = open("iteration-4/eval-009-with-skill/outputs/product-vision.md").read()
    results = []
    # Check elevator pitch
    required = ["For", "Who", "The Product", "Is a", "That", "Unlike", "Our Product"]
    found = count_occurrences(content, required)
    results.append({"text": "Elevator pitch completeness", "passed": found >= 7, "evidence": f"Found {found}/7"})
    # Check boundaries
    boundary_terms = ["IS", "IS NOT", "DOES", "DOES NOT"]
    found = count_occurrences_exact(content, boundary_terms)
    results.append({"text": "Clear boundaries defined", "passed": found >= 4, "evidence": f"Found {found}/4"})
    # Check product name
    passed, info = check_product_name_consistency(content, "EcoTrack")
    results.append({"text": "Product name consistency", "passed": passed, "evidence": f"EcoTrack found {info['mentions']} times"})
    return results

def grade_eval_010():
    """Batch Generation - TaskFlow"""
    output_dir = "iteration-4/eval-010-with-skill/outputs"
    results = []
    file_count = count_files(output_dir, "*.md")
    results.append({"text": "All 8 inception steps generated", "passed": file_count >= 8, "evidence": f"Found {file_count} files"})
    files = sorted(Path(output_dir).glob("*.md"))
    all_content = "".join(open(f).read() for f in files)
    mentions = all_content.lower().count("taskflow")
    results.append({"text": "Consistent product naming", "passed": mentions >= 15, "evidence": f"TaskFlow mentioned {mentions} times"})
    return results

def grade_eval_011():
    """Brainstorming - GreenSpace"""
    content = open("iteration-4/eval-011-with-skill/outputs/brainstorming.md").read()
    results = []
    # Check feature count
    feature_pattern = r'^\d+\.'
    features = re.findall(feature_pattern, content, re.MULTILINE)
    results.append({"text": "At least 20 feature ideas", "passed": len(features) >= 20, "evidence": f"Found {len(features)} features"})
    # Check affinity grouping
    grouping_terms = ["Category", "Grouping", "Affinity"]
    found = count_occurrences_exact(content, grouping_terms)
    results.append({"text": "Affinity grouping included", "passed": found >= 1, "evidence": f"Found {found} grouping indicators"})
    # Check prioritization
    priority_terms = ["Must", "Should", "Could", "Won't", "Priority"]
    found = count_occurrences_exact(content, priority_terms)
    results.append({"text": "Prioritization included", "passed": found >= 3, "evidence": f"Found {found} priority indicators"})
    # Check product name
    passed, info = check_product_name_consistency(content, "GreenSpace")
    results.append({"text": "Product name consistency", "passed": passed, "evidence": f"GreenSpace found {info['mentions']} times"})
    return results

def main():
    print("=" * 70)
    print("INCEPTION WORKSHOP SKILL EVALUATION - ITERATION 4 (10 TEST CASES)")
    print("=" * 70)
    print()
    
    all_results = {}
    
    # Grade all 10 evals
    evals = [
        ("EVAL-001 (Product Vision - SessioFlow)", grade_eval_001),
        ("EVAL-002 (Batch Generation - SessioFlow)", grade_eval_002),
        ("EVAL-003 (Tradeoff Analysis - SessioFlow)", grade_eval_003),
        ("EVAL-004 (Personas - QuickBite)", grade_eval_004),
        ("EVAL-005 (User Journey - HealthConnect)", grade_eval_005),
        ("EVAL-006 (Empathy Map - HomeHub)", grade_eval_006),
        ("EVAL-007 (Features - PayEasy)", grade_eval_007),
        ("EVAL-008 (MVP Canvas - SkillUp)", grade_eval_008),
        ("EVAL-009 (Product Vision - EcoTrack)", grade_eval_009),
        ("EVAL-010 (Batch Generation - TaskFlow)", grade_eval_010),
        ("EVAL-011 (Brainstorming - GreenSpace)", grade_eval_011),
    ]
    
    for eval_name, grade_func in evals:
        print(eval_name)
        print("-" * 70)
        results = grade_func()
        all_results[eval_name] = results
        for r in results:
            status = "✅ PASS" if r["passed"] else "❌ FAIL"
            print(f"  {status}: {r['text']}")
            print(f"         {r['evidence']}")
        print()
    
    # Summary
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    total_assertions = sum(len(r) for r in all_results.values())
    passed_assertions = sum(1 for results in all_results.values() for r in results if r["passed"])
    pass_rate = (passed_assertions / total_assertions) * 100
    
    print(f"Total test cases: 10")
    print(f"Total assertions: {total_assertions}")
    print(f"Passed: {passed_assertions}")
    print(f"Failed: {total_assertions - passed_assertions}")
    print(f"Pass rate: {pass_rate:.1f}%")
    print()
    
    # Save grading results
    with open("iteration-4/grading.json", 'w') as f:
        json.dump(all_results, f, indent=2)
    
    print("Grading results saved to iteration-4/grading.json")

if __name__ == "__main__":
    main()
