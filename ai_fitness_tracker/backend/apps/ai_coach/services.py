"""
AI Coach App - Service Layer
Integrates with Anthropic Claude for personalized fitness coaching.
"""
import json
import os
import anthropic


def build_user_context(user) -> str:
    """Build a detailed user fitness context string for the AI."""
    parts = [
        f"User: {user.get_full_name() or user.username}",
        f"Age: {user.age or 'Not provided'}",
        f"Gender: {user.get_gender_display() if user.gender else 'Not provided'}",
        f"Height: {user.height_cm}cm" if user.height_cm else "Height: Not provided",
        f"Weight: {user.weight_kg}kg" if user.weight_kg else "Weight: Not provided",
        f"BMI: {user.bmi}" if user.bmi else "",
        f"Fitness Goal: {user.get_fitness_goal_display()}",
        f"Fitness Level: {user.get_fitness_level_display()}",
    ]
    return "\n".join(p for p in parts if p)


SYSTEM_PROMPT = """You are an expert AI fitness coach. You provide personalized, 
evidence-based fitness and nutrition advice. You are encouraging, precise, and safety-conscious.
Always recommend consulting a doctor before starting intense exercise programs.
Keep responses concise and actionable."""


def get_ai_response(user, user_message: str, conversation_history: list) -> str:
    """
    Call Anthropic API and return the assistant's reply.
    Falls back to a structured mock response if no API key is configured.
    """
    api_key = os.environ.get('ANTHROPIC_API_KEY', '')

    if not api_key:
        # Structured fallback when no API key is set
        return (
            f"I'm your AI Fitness Coach! I'd love to help you with: '{user_message}'.\n\n"
            "To enable real AI responses, set the ANTHROPIC_API_KEY environment variable.\n\n"
            "In the meantime, here are some general tips:\n"
            "• Aim for 150+ minutes of moderate exercise per week\n"
            "• Stay hydrated — 8 glasses of water daily\n"
            "• Prioritise sleep — 7-9 hours for recovery\n"
            "• Combine strength training with cardio for best results"
        )

    client = anthropic.Anthropic(api_key=api_key)

    user_context = build_user_context(user)
    system = f"{SYSTEM_PROMPT}\n\nUser Profile:\n{user_context}"

    messages = conversation_history[-10:]  # last 10 messages for context window
    messages.append({"role": "user", "content": user_message})

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system=system,
        messages=messages,
    )
    return response.content[0].text


def generate_workout_plan(user, goals: str, constraints: str = "") -> str:
    """Generate a personalised workout plan using AI."""
    api_key = os.environ.get('ANTHROPIC_API_KEY', '')

    prompt = f"""
Create a detailed, personalized workout plan for this user.

User Profile:
{build_user_context(user)}

Goals: {goals}
Constraints/Limitations: {constraints or 'None'}

Please provide:
1. Weekly schedule overview
2. Specific exercises for each day with sets, reps, and rest times
3. Warm-up and cool-down recommendations
4. Progressive overload suggestions
5. Important safety notes

Format the plan clearly with sections and bullet points.
"""

    if not api_key:
        return (
            "**Sample AI-Generated Workout Plan**\n\n"
            "**Weekly Schedule:**\n"
            "- Monday: Upper Body Strength\n"
            "- Wednesday: Lower Body & Core\n"
            "- Friday: Full Body HIIT\n"
            "- Weekend: Active Recovery (walking, yoga)\n\n"
            "Set ANTHROPIC_API_KEY for a personalized plan."
        )

    client = anthropic.Anthropic(api_key=api_key)
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text
