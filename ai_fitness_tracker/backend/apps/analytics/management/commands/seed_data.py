"""
Management command to seed the database with sample exercises and food items.
Usage: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from apps.workouts.models import ExerciseCategory, Exercise
from apps.nutrition.models import FoodItem
from apps.analytics.models import Achievement


class Command(BaseCommand):
    help = 'Seed database with initial exercise and food data'

    def handle(self, *args, **kwargs):
        self.seed_categories()
        self.seed_exercises()
        self.seed_foods()
        self.seed_achievements()
        self.stdout.write(self.style.SUCCESS('✅ Database seeded successfully!'))

    def seed_categories(self):
        cats = [
            ('Strength',    'Weight training and resistance exercises', '💪'),
            ('Cardio',      'Cardiovascular endurance exercises',        '🏃'),
            ('Flexibility', 'Stretching and mobility work',              '🧘'),
            ('HIIT',        'High Intensity Interval Training',          '⚡'),
            ('Yoga',        'Yoga and mindfulness practices',            '🌿'),
        ]
        for name, desc, icon in cats:
            ExerciseCategory.objects.get_or_create(name=name, defaults={'description': desc, 'icon': icon})
        self.stdout.write('  → Exercise categories seeded')

    def seed_exercises(self):
        strength = ExerciseCategory.objects.get(name='Strength')
        cardio   = ExerciseCategory.objects.get(name='Cardio')

        exercises = [
            # Strength
            dict(name='Barbell Squat',      category=strength, primary_muscle='legs',      difficulty='intermediate', equipment='Barbell, Rack',       calories_per_min=8,  instructions='Stand with feet shoulder-width apart. Lower until thighs parallel to floor.'),
            dict(name='Bench Press',        category=strength, primary_muscle='chest',     difficulty='intermediate', equipment='Barbell, Bench',      calories_per_min=7,  instructions='Lie on bench. Lower bar to chest, press back up.'),
            dict(name='Deadlift',           category=strength, primary_muscle='back',      difficulty='advanced',     equipment='Barbell',             calories_per_min=9,  instructions='Hinge at hips, grip bar, drive through heels to stand.'),
            dict(name='Pull-Up',            category=strength, primary_muscle='back',      difficulty='intermediate', equipment='Pull-up Bar',         calories_per_min=7,  instructions='Hang from bar, pull chest to bar, lower slowly.'),
            dict(name='Overhead Press',     category=strength, primary_muscle='shoulders', difficulty='intermediate', equipment='Barbell or Dumbbells', calories_per_min=7),
            dict(name='Dumbbell Curl',      category=strength, primary_muscle='arms',      difficulty='beginner',     equipment='Dumbbells',           calories_per_min=5),
            dict(name='Tricep Dip',         category=strength, primary_muscle='arms',      difficulty='beginner',     equipment='Parallel Bars',       calories_per_min=6),
            dict(name='Plank',              category=strength, primary_muscle='core',      difficulty='beginner',     equipment='None',                calories_per_min=4),
            dict(name='Leg Press',          category=strength, primary_muscle='legs',      difficulty='beginner',     equipment='Leg Press Machine',   calories_per_min=7),
            dict(name='Lat Pulldown',       category=strength, primary_muscle='back',      difficulty='beginner',     equipment='Cable Machine',       calories_per_min=6),
            dict(name='Push-Up',            category=strength, primary_muscle='chest',     difficulty='beginner',     equipment='None',                calories_per_min=6),
            dict(name='Glute Bridge',       category=strength, primary_muscle='glutes',    difficulty='beginner',     equipment='None',                calories_per_min=5),
            # Cardio
            dict(name='Running',            category=cardio,   primary_muscle='cardio',    difficulty='beginner',     equipment='None',                calories_per_min=11),
            dict(name='Cycling',            category=cardio,   primary_muscle='cardio',    difficulty='beginner',     equipment='Bike',                calories_per_min=10),
            dict(name='Jump Rope',          category=cardio,   primary_muscle='cardio',    difficulty='beginner',     equipment='Jump Rope',           calories_per_min=12),
            dict(name='Burpees',            category=cardio,   primary_muscle='full_body', difficulty='intermediate', equipment='None',                calories_per_min=10),
            dict(name='Mountain Climbers',  category=cardio,   primary_muscle='core',      difficulty='intermediate', equipment='None',                calories_per_min=9),
            dict(name='Box Jumps',          category=cardio,   primary_muscle='legs',      difficulty='intermediate', equipment='Plyo Box',            calories_per_min=10),
        ]
        for ex in exercises:
            Exercise.objects.get_or_create(name=ex['name'], defaults=ex)
        self.stdout.write('  → Exercises seeded')

    def seed_foods(self):
        foods = [
            dict(name='Chicken Breast',   calories=165, protein_g=31,  carbs_g=0,   fat_g=3.6, serving_size=100, is_verified=True),
            dict(name='Brown Rice',       calories=216, protein_g=5,   carbs_g=45,  fat_g=1.8, serving_size=100, is_verified=True),
            dict(name='Whole Eggs',       calories=155, protein_g=13,  carbs_g=1.1, fat_g=11,  serving_size=100, is_verified=True),
            dict(name='Oatmeal',          calories=389, protein_g=17,  carbs_g=66,  fat_g=7,   serving_size=100, is_verified=True),
            dict(name='Banana',           calories=89,  protein_g=1.1, carbs_g=23,  fat_g=0.3, serving_size=100, is_verified=True),
            dict(name='Greek Yogurt',     calories=59,  protein_g=10,  carbs_g=3.6, fat_g=0.4, serving_size=100, is_verified=True),
            dict(name='Salmon',           calories=208, protein_g=20,  carbs_g=0,   fat_g=13,  serving_size=100, is_verified=True),
            dict(name='Sweet Potato',     calories=86,  protein_g=1.6, carbs_g=20,  fat_g=0.1, serving_size=100, is_verified=True),
            dict(name='Broccoli',         calories=34,  protein_g=2.8, carbs_g=7,   fat_g=0.4, serving_size=100, is_verified=True),
            dict(name='Almonds',          calories=579, protein_g=21,  carbs_g=22,  fat_g=50,  serving_size=100, is_verified=True),
            dict(name='Whey Protein',     calories=400, protein_g=80,  carbs_g=8,   fat_g=5,   serving_size=100, is_verified=True),
            dict(name='Quinoa',           calories=120, protein_g=4.4, carbs_g=21,  fat_g=1.9, serving_size=100, is_verified=True),
            dict(name='Cottage Cheese',   calories=98,  protein_g=11,  carbs_g=3.4, fat_g=4.3, serving_size=100, is_verified=True),
            dict(name='Peanut Butter',    calories=588, protein_g=25,  carbs_g=20,  fat_g=50,  serving_size=100, is_verified=True),
            dict(name='Tuna (canned)',    calories=116, protein_g=26,  carbs_g=0,   fat_g=1,   serving_size=100, is_verified=True),
        ]
        for f in foods:
            FoodItem.objects.get_or_create(name=f['name'], defaults=f)
        self.stdout.write('  → Foods seeded')

    def seed_achievements(self):
        achievements = [
            dict(name='First Workout',      description='Complete your first workout session',    category='workout',   icon='🏋️', points=10),
            dict(name='Week Warrior',       description='Complete 7 workouts in a week',          category='streak',    icon='⚡', points=50),
            dict(name='Consistency King',   description='Maintain a 30-day workout streak',       category='streak',    icon='👑', points=200),
            dict(name='Calorie Crusher',    description='Burn 500+ calories in a single session', category='workout',   icon='🔥', points=30),
            dict(name='Hydration Hero',     description='Log 2.5L of water for 7 days straight',  category='nutrition', icon='💧', points=25),
            dict(name='Nutrition Nerd',     description='Log all meals for 14 days in a row',     category='nutrition', icon='🥗', points=75),
            dict(name='Weight Milestone',   description='Log your first weight update',           category='weight',    icon='⚖️', points=10),
            dict(name='Century Club',       description='Complete 100 total workout sessions',    category='milestone', icon='💯', points=500),
        ]
        for a in achievements:
            Achievement.objects.get_or_create(name=a['name'], defaults=a)
        self.stdout.write('  → Achievements seeded')
