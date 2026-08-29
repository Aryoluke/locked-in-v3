const EXERCISE_OBJECTS = [
  {
    name: 'Incline DB Press', muscle: 'Chest', pattern: 'Push',
    variation: 'Low incline, neutral-grip dumbbell press',
    formCues: ['Set shoulder blades down and back', 'Lower with elbows 30–45° from your ribs', 'Press up without letting the dumbbells drift together'],
    targetMuscles: ['Upper chest', 'Front delts', 'Triceps'],
    demoNote: 'Keep both feet planted and use a controlled two-second lower.'
  },
  {
    name: 'Back Squat', muscle: 'Quads', pattern: 'Squat',
    variation: 'High-bar back squat to a comfortable depth',
    formCues: ['Brace before unracking', 'Track knees over the middle toes', 'Drive up through the whole foot'],
    targetMuscles: ['Quads', 'Glutes', 'Adductors'],
    demoNote: 'Film from the side to check depth and a neutral torso.'
  },
  {
    name: 'Romanian Deadlift', muscle: 'Hamstrings', pattern: 'Hinge',
    variation: 'Dumbbell or barbell Romanian deadlift',
    formCues: ['Unlock the knees slightly', 'Push hips back while keeping the load close', 'Stop when the hamstrings are loaded without rounding'],
    targetMuscles: ['Hamstrings', 'Glutes', 'Spinal erectors'],
    demoNote: 'Think long spine and quiet shins rather than reaching for the floor.'
  },
  {
    name: 'Pull Up', muscle: 'Back', pattern: 'Pull',
    variation: 'Strict pull-up with a shoulder-width grip',
    formCues: ['Start from an active hang', 'Pull elbows toward your sides', 'Clear the bar without craning your neck'],
    targetMuscles: ['Lats', 'Upper back', 'Biceps'],
    demoNote: 'Use a band or low box for smooth full-range reps while building strength.'
  },
  {
    name: 'Cable Lateral Raise', muscle: 'Shoulders', pattern: 'Push',
    variation: 'Single-arm cable lateral raise',
    formCues: ['Set the cable just behind you', 'Lead with the elbow', 'Stop around shoulder height'],
    targetMuscles: ['Lateral delts', 'Supraspinatus'],
    demoNote: 'Use a light load and keep the torso still instead of swinging.'
  },
  {
    name: 'Plank', muscle: 'Core', pattern: 'Brace',
    variation: 'Long-lever forearm plank',
    formCues: ['Squeeze glutes and quads', 'Ribs down with a steady breath', 'Push the floor away'],
    targetMuscles: ['Abdominals', 'Obliques', 'Glutes'],
    demoNote: 'End the set when the hips sag or the breath becomes forced.'
  },
  {
    name: 'Dead Hang', muscle: 'Grip', pattern: 'Hang',
    variation: 'Active or relaxed bar hang',
    formCues: ['Use a secure overhand grip', 'Keep shoulders comfortable', 'Dismount under control'],
    targetMuscles: ['Forearms', 'Grip', 'Shoulder stabilisers'],
    demoNote: 'Start with feet-assisted holds if the shoulders or elbows are sensitive.'
  },
  {
    name: 'Bench Press', muscle: 'Chest', pattern: 'Push',
    variation: 'Paused barbell bench press',
    formCues: ['Pull the bar over the mid-chest', 'Keep wrists stacked over elbows', 'Pause lightly without relaxing the brace'],
    targetMuscles: ['Chest', 'Triceps', 'Front delts'],
    demoNote: 'Use a spotter or safety arms for every challenging set.'
  },
  {
    name: 'Bulgarian Split Squat', muscle: 'Legs', pattern: 'Lunge',
    variation: 'Front-foot-elevated split squat',
    formCues: ['Find a stable stance before loading', 'Let the front knee travel naturally', 'Keep the pelvis facing forward'],
    targetMuscles: ['Quads', 'Glutes', 'Adductors'],
    demoNote: 'Hold onto a rack while learning balance, then add load gradually.'
  },
  {
    name: 'Seated Cable Row', muscle: 'Back', pattern: 'Pull',
    variation: 'Neutral-grip seated cable row',
    formCues: ['Reach without collapsing the lower back', 'Pull handle to the lower ribs', 'Finish with shoulder blades moving, not shrugging'],
    targetMuscles: ['Mid-back', 'Lats', 'Rear delts'],
    demoNote: 'Pause at the ribs and keep the return slower than the pull.'
  },
  {
    name: 'Push Up', muscle: 'Chest', pattern: 'Push',
    variation: 'Hands-elevated to floor push-up progression',
    formCues: ['Keep hands just outside shoulder width', 'Brace from shoulders through heels', 'Lower chest and hips together'],
    targetMuscles: ['Chest', 'Triceps', 'Serratus'],
    demoNote: 'Raise the hands to keep clean reps instead of shortening the range.'
  },
  {
    name: 'Hip Thrust', muscle: 'Glutes', pattern: 'Hinge',
    variation: 'Bench-supported barbell hip thrust',
    formCues: ['Tuck the chin slightly', 'Finish with ribs stacked over pelvis', 'Pause at full hip extension'],
    targetMuscles: ['Glute max', 'Hamstrings', 'Adductors'],
    demoNote: 'Use a pad and keep the top position controlled rather than hyperextending.'
  }
];

// Legacy consumers use exercises as [name, muscle, pattern]. Keep that shape while
// attaching the richer fields and exposing the plain exercise objects below.
const LEGACY_EXERCISES = EXERCISE_OBJECTS.map(exercise => Object.assign(
  [exercise.name, exercise.muscle, exercise.pattern],
  exercise
));

const LI_DATA = {
  exercises: LEGACY_EXERCISES,
  exerciseDetails: EXERCISE_OBJECTS,
  workouts: [
    { name: 'Upper strength', duration: 52, items: ['Incline DB Press', 'Pull Up', 'Cable Lateral Raise'] },
    { name: 'Lower strength', duration: 48, items: ['Back Squat', 'Romanian Deadlift', 'Plank'] },
    { name: 'Athletic reset', duration: 25, items: ['Plank', 'Dead Hang'] },
    { name: 'Full-body minimum', duration: 30, items: ['Goblet Squat', 'Push Up', 'Seated Cable Row', 'Dead Hang'] }
  ],
  meals: [
    ['Protein oats', 520, 38, 58, 16],
    ['Chicken rice bowl', 680, 52, 74, 18],
    ['Greek yoghurt crunch', 310, 25, 31, 9],
    ['Green recovery smoothie', 280, 24, 35, 6],
    ['Tuna bean jacket potato', 560, 42, 63, 12],
    ['Turkey pesto pasta', 640, 48, 70, 17],
    ['Tofu noodle stir-fry', 470, 28, 58, 15],
    ['Egg and bean breakfast wrap', 450, 29, 44, 18],
    ['Cottage cheese berry bowl', 290, 27, 28, 8]
  ],
  subjects: ['Maths', 'Biology', 'History', 'Language', 'Physics'],
  habits: ['Train or walk', '2L water', 'Read 20 minutes', 'Morning skincare', 'No phone in bed', 'Brush + floss'],
  skills: ['Muscle-up', 'Front lever', 'Planche', 'One-arm pull-up', '100kg bench', 'Dead hang'],
  skillProgressions: [
    { skill: 'Muscle-up', steps: ['Scapular pull-up and hollow hang', 'Chest-to-bar pull-up', 'Low-ring transition drill', 'Band-assisted strict muscle-up', 'Strict bar muscle-up'], frequency: '2–3 sessions/week', benchmark: '3 controlled reps with no kip' },
    { skill: 'Front lever', steps: ['Tuck hold', 'Advanced tuck hold', 'One-leg tuck', 'Straddle hold', 'Full front lever'], frequency: '2–3 sessions/week', benchmark: '10-second hold with straight hips' },
    { skill: 'Planche', steps: ['Planche lean', 'Frog stand', 'Tuck planche', 'Advanced tuck planche', 'Straddle planche'], frequency: '2 sessions/week', benchmark: '8-second hold with locked elbows' },
    { skill: 'One-arm pull-up', steps: ['Active one-arm hang', 'Archer pull-up', 'Assisted one-arm eccentric', 'Isometric top and middle holds', 'Strict one-arm pull-up'], frequency: '2 sessions/week', benchmark: '5-second controlled eccentric each arm' },
    { skill: '100kg bench', steps: ['Consistent paused technique', '70kg for clean volume', '80kg for 5 reps', '90kg for 2 reps', '100kg single'], frequency: '2 bench exposures/week', benchmark: 'One smooth, judged-quality 100kg rep' },
    { skill: 'Dead hang', steps: ['Feet-assisted hang', '20-second relaxed hang', '30-second active hang', '45-second mixed-grip-free hang', '60-second active hang'], frequency: '3–5 short practices/week', benchmark: '60 seconds with shoulders comfortable' }
  ],
  hacks: [
    ['Focus', 'Two-minute launch', 'Set a timer for two minutes and begin the smallest visible action before deciding whether to continue.'],
    ['Focus', 'Single-task staging', 'Leave only the tool for the next task on the desk; put everything else out of reach.'],
    ['Social', 'FORD questions', 'Use Family, Occupation, Recreation and Dreams to keep conversations curious and easy.'],
    ['Style', 'Fit before labels', 'Prioritise shoulder seams, trouser break and clean shoes; tailoring beats a louder label.'],
    ['Home', 'Ten-percent reset', 'Before leaving a room, return one surface or item to a slightly better state.'],
    ['Confidence', 'Slow finish', 'Slow down your speech and finish each sentence before planning the next one.'],
    ['Study', 'Recall first', 'Close the notes and write what you remember before checking the answer.'],
    ['Recovery', 'Friction audit', 'Put water, walking shoes and tomorrow’s training clothes where you will see them.']
  ],
  vault: [
    ['Focus', 'Use the 2-minute rule. Start before motivation arrives.'],
    ['Social', 'FORD questions: Family, Occupation, Recreation, Dreams.'],
    ['Style', 'Fit first; tailoring beats labels every time.'],
    ['Home', 'Reset surfaces and leave each room 10% better.'],
    ['Confidence', 'Slow down your speech and finish your sentences.']
  ],
  sports: ['Rugby', 'Football', 'Tennis', 'Swimming', 'Cricket', 'Hockey', 'Athletics', 'Basketball', 'Volleyball', 'Boxing', 'Cycling', 'Rowing', 'Climbing'],
  sportProfiles: [
    { sport: 'Rugby', focus: 'Repeat sprint ability, contact readiness and lower-body strength', starter: '2 strength sessions plus short acceleration work' },
    { sport: 'Football', focus: 'Aerobic repeatability, change of direction and single-leg control', starter: 'Intervals, split squats and ankle mobility' },
    { sport: 'Tennis', focus: 'Rotational power, footwork and shoulder resilience', starter: 'Lateral drills, medicine-ball throws and pulling volume' },
    { sport: 'Swimming', focus: 'Technique, aerobic capacity and shoulder mobility', starter: 'Easy technique lengths with gradual volume' },
    { sport: 'Cricket', focus: 'Throwing capacity, sprinting and trunk rotation', starter: 'Build shoulder volume slowly and add short sprints' },
    { sport: 'Hockey', focus: 'Repeated efforts, lateral movement and hip mobility', starter: 'Shuttle intervals plus adductor and calf strength' },
    { sport: 'Athletics', focus: 'Event-specific speed, elastic strength and technical practice', starter: 'Choose one event and keep quality ahead of volume' },
    { sport: 'Basketball', focus: 'Jump skill, deceleration and repeated sprint ability', starter: 'Landing mechanics, calf strength and short court intervals' },
    { sport: 'Volleyball', focus: 'Approach mechanics, shoulder control and reactive movement', starter: 'Low-volume jumps with landing and rotator-cuff work' },
    { sport: 'Boxing', focus: 'Footwork, conditioning and trunk stiffness', starter: 'Technical shadowboxing before adding hard rounds' },
    { sport: 'Cycling', focus: 'Aerobic base, cadence and sustained leg output', starter: 'Mostly easy rides with one controlled effort session' },
    { sport: 'Rowing', focus: 'Leg drive, trunk sequencing and aerobic power', starter: 'Short technique intervals before longer pieces' },
    { sport: 'Climbing', focus: 'Grip endurance, scapular control and movement efficiency', starter: 'Easy mileage plus antagonist pushing work' }
  ],
  recipes: ['One-pan lemon chicken', 'High-protein chilli', 'Overnight oats', 'Green recovery smoothie', 'Tuna bean jacket potato', 'Turkey pesto pasta', 'Tofu noodle stir-fry', 'Egg and bean breakfast wrap', 'Cottage cheese berry bowl', 'Salmon tray bake', 'Lentil tomato soup', 'Chicken fajita salad'],
  recipeDetails: [
    { name: 'One-pan lemon chicken', prepMinutes: 10, cookMinutes: 25, ingredients: ['chicken breast', 'baby potatoes', 'green beans', 'lemon', 'olive oil'], steps: ['Season chicken and potatoes', 'Roast until nearly tender', 'Add beans and finish until chicken is cooked through'], tags: ['high-protein', 'batch-friendly'] },
    { name: 'High-protein chilli', prepMinutes: 10, cookMinutes: 30, ingredients: ['lean mince or soy mince', 'kidney beans', 'tomatoes', 'onion', 'paprika'], steps: ['Brown the mince and onion', 'Add beans, tomatoes and spices', 'Simmer until thick'], tags: ['freezer-friendly', 'high-fibre'] },
    { name: 'Overnight oats', prepMinutes: 5, cookMinutes: 0, ingredients: ['oats', 'Greek yoghurt', 'milk', 'berries', 'chia seeds'], steps: ['Mix in a jar', 'Chill overnight', 'Add fruit before eating'], tags: ['breakfast', 'no-cook'] },
    { name: 'Green recovery smoothie', prepMinutes: 5, cookMinutes: 0, ingredients: ['milk', 'banana', 'spinach', 'Greek yoghurt', 'frozen berries'], steps: ['Blend until smooth', 'Add liquid to adjust texture', 'Drink soon after training'], tags: ['quick', 'post-training'] },
    { name: 'Tuna bean jacket potato', prepMinutes: 8, cookMinutes: 45, ingredients: ['potato', 'tuna', 'white beans', 'yoghurt', 'spring onion'], steps: ['Bake or microwave the potato', 'Mix tuna and beans with yoghurt', 'Split and fill the potato'], tags: ['budget', 'high-protein'] },
    { name: 'Turkey pesto pasta', prepMinutes: 10, cookMinutes: 15, ingredients: ['turkey mince', 'wholewheat pasta', 'pesto', 'cherry tomatoes', 'spinach'], steps: ['Cook pasta', 'Brown turkey', 'Toss everything together with tomatoes and spinach'], tags: ['batch-friendly', 'balanced'] },
    { name: 'Tofu noodle stir-fry', prepMinutes: 12, cookMinutes: 10, ingredients: ['firm tofu', 'rice noodles', 'frozen mixed vegetables', 'soy sauce', 'lime'], steps: ['Press and crisp tofu', 'Soften noodles', 'Stir-fry vegetables and combine'], tags: ['vegetarian', 'quick'] },
    { name: 'Egg and bean breakfast wrap', prepMinutes: 5, cookMinutes: 8, ingredients: ['eggs', 'black beans', 'wholegrain wrap', 'salsa', 'cheese'], steps: ['Scramble eggs', 'Warm beans and wrap', 'Fill, fold and toast'], tags: ['breakfast', 'portable'] },
    { name: 'Cottage cheese berry bowl', prepMinutes: 4, cookMinutes: 0, ingredients: ['cottage cheese', 'berries', 'oats', 'honey', 'pumpkin seeds'], steps: ['Add cottage cheese to a bowl', 'Top with berries and oats', 'Finish with seeds and honey'], tags: ['snack', 'no-cook'] },
    { name: 'Salmon tray bake', prepMinutes: 8, cookMinutes: 22, ingredients: ['salmon', 'sweet potato', 'broccoli', 'lemon', 'dill'], steps: ['Roast sweet potato first', 'Add salmon and broccoli', 'Finish with lemon and dill'], tags: ['omega-3', 'one-pan'] },
    { name: 'Lentil tomato soup', prepMinutes: 8, cookMinutes: 25, ingredients: ['red lentils', 'tinned tomatoes', 'carrot', 'stock', 'cumin'], steps: ['Soften carrot', 'Add lentils, tomatoes and stock', 'Simmer until soft and season'], tags: ['vegetarian', 'freezer-friendly'] },
    { name: 'Chicken fajita salad', prepMinutes: 12, cookMinutes: 12, ingredients: ['chicken', 'peppers', 'lettuce', 'corn', 'lime yoghurt'], steps: ['Cook spiced chicken and peppers', 'Build the salad base', 'Top with corn and lime yoghurt'], tags: ['high-protein', 'fresh'] }
  ],
  products: [
    { name: 'Adjustable dumbbells', category: 'training', use: 'Progressive full-body strength at home', practicalNote: 'Choose a range that supports both presses and rows without sacrificing form.' },
    { name: 'Door-frame pull-up bar', category: 'training', use: 'Pull-ups, hangs and skill practice', practicalNote: 'Check the frame rating and installation instructions before loading it.' },
    { name: 'Long resistance band', category: 'training', use: 'Assisted pull-ups, warm-ups and mobility', practicalNote: 'Inspect for tears and keep the anchor point secure.' },
    { name: 'Skipping rope', category: 'conditioning', use: 'Short-footwork and conditioning blocks', practicalNote: 'Start with easy intervals and a forgiving surface.' },
    { name: 'Food scale', category: 'nutrition', use: 'Consistent portions while learning serving sizes', practicalNote: 'Use it as a short-term learning tool, not a requirement for every meal.' },
    { name: 'Insulated water bottle', category: 'recovery', use: 'Make regular hydration visible and portable', practicalNote: 'Mark a refill target so the 2L habit is easy to audit.' },
    { name: 'Massage ball', category: 'recovery', use: 'Gentle local tissue work before mobility', practicalNote: 'Use comfortable pressure and avoid painful or numb areas.' },
    { name: 'Training notebook', category: 'tracking', use: 'Log sets, reps, RPE and one form cue', practicalNote: 'Record the next action immediately after each session.' },
    { name: 'Foam roller', category: 'recovery', use: 'Warm-up movement and relaxed cooldown work', practicalNote: 'Pair it with active mobility rather than treating it as a fix.' },
    { name: 'Lifting straps', category: 'training', use: 'Extra pulling volume when grip is the limiter', practicalNote: 'Keep direct grip work in the plan if grip is a goal.' }
  ],
  challenges: ['7-day hydration', '30-day posture', 'Cold finish', 'Digital sunset', 'Public speaking reps']
};

// data.js historically exposed LI_DATA; keep it and also provide the browser global
// consumed by the v3 app when this file is loaded before the app modules.
if (typeof window !== 'undefined') window.LOCKED_DATA = LI_DATA;
