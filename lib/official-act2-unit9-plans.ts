import type {PlannerBlock} from './lesson-planner';
import type {OfficialPlannerPlan} from './official-lesson-plans';
type Stage=[string,number,PlannerBlock['kind'],string];
function plan(session:number,title:string,pages:string,manual:number,objectives:string,materials:string,support:string,stages:Stage[]):OfficialPlannerPlan{
 const id='official-act2-u9-'+session;
 return {kind:'plan',id,groupId:'',book:'ACT2',unit:9,lessonId:'act2-u9-lesson'+Math.min(session,4),title:`Session 9.${session} · ${title}`,date:'',duration:40,status:'ready',objectives,comments:'',revision:0,updatedAt:0,
 source:{book:'ACT2 · Official Topic 9 lesson plans',pages:`PDF ${pages}; Manual ${manual}`,materials,support,timings:'source'},
 blocks:stages.map(([stage,minutes,kind,instructions],i)=>({id:id+'-'+i,stage,minutes,kind,instructions,title:'',resourceId:'',comments:'',url:''}))};
}
export const officialAct2Unit9Plans:OfficialPlannerPlan[]=[
 plan(1,'Where are you going?','1–4',67,
 'Name school, farm, hospital and airport. Ask “Where are you going?” and answer “I’m going to the…” while moving around a city map.',
 'Session 1 printables; city map and building cards; Jake/Chuckles puppets; sticky notes; matching place-card sets; boxes or bags.',
 'Model with puppets before asking children to speak independently. Source cleanup: use place cards in Matching Game; collect matching pairs and return non-matches.',[
 ['Warm-up · Mirror Me',5,'game',`Greet children, review the class rules and establish the usual routine. Use familiar weather language for a short Mirror Me activity.
In pairs, choose a leader. The partner copies the leader’s movement or expression while both say the matching weather language. Change leaders so each child has a turn.
Invite a few children to explain or demonstrate what they copied. Keep this as a short review before introducing the city context.`],
 ['Stage 1 · Puppet journey & Broken Telephone',10,'activity',`Put the city map and buildings where everyone can see them. Include the later-session buildings as background, but focus today on school, farm, hospital and airport.
Move Jake to a building while Chuckles asks “Where are you going?” Jake answers “I’m going to the hospital.” Repeat for the four places, then invite children to supply the answer.
For Broken Telephone, children form a line or circle. Whisper one destination sentence to the first child; each passes it on once. The last child says it aloud. Compare it with the starting sentence, model any unclear words and change the destination.`],
 ['Stage 2 · Rhythm Leader & Places on the Map',10,'game',`Choose a secret rhythm leader while one child waits apart from the group. The leader starts a clap or tap with a destination sentence; the others copy and follow changes. The guesser returns and has three chances to identify the leader; rotate roles.
For Places on the Map, children close their eyes while you rearrange the buildings and cover the four target places with sticky notes.
The class asks “Where are you going?” to a steady beat. A child moves a puppet to a covered place, reveals it and answers with the destination. Rotate the questioner and puppet roles.`],
 ['Showtime · Matching Game',10,'game',`Seat children in two facing rows and give each row a matching set of place cards. Put the cards face down in front of the children.
Everyone asks “Where are you going?” One child from each row turns over a card and answers according to the picture.
Compare the two destinations. Put matching pairs into a box or bag. Turn non-matching cards face down and continue, changing players until the pairs have been collected. Prompt the sentence rather than accepting only a place name.`],
 ['Wrap-up & assignment',5,'activity',`Briefly revisit any destination words or sentence parts that caused difficulty. Use the map for a final question-and-answer exchange, then reward participation, tidy up and say goodbye.
Homework: repeat along with the lesson review video; practise “Where are you going?” / “I’m going to the school/farm/hospital/airport” with a parent; complete Notebook page 49.
Show the Notebook task before children leave and check that they know what to do.`],
 ]),
 plan(2,'Who are you going to see?','5–10',68,
 'Match teacher, farmer, doctor and pilot to their workplaces. Combine destination and person questions in a short dialogue.',
 'Session 2 printables; city map; building/profession mini cards; Jake/Chuckles puppets; counters; card flaps or pouches; matching word cards.',
 'Hide each profession beneath its matching building so children can check by lifting the flap. Source vocabulary typo “farm” is corrected to “farmer”.',[
 ['Warm-up · Rhythm Leader',5,'game',`Greet children, check the previous assignment and review the routine. Use a short Rhythm Leader round to recall familiar words and sentence patterns.
One child waits apart while the group chooses a secret leader. Everyone copies the leader’s rhythm and spoken line as it changes; the returning child tries to identify the leader.
Rotate roles and finish by asking where children are going, ready to add the person they will meet.`],
 ['Stage 1 · Building-window stations',10,'activity',`Before class, put profession pictures on the map and cover each with its matching building picture. Use a flap or two-layer pouch so children can reveal the person underneath.
Model a visit with the puppets: “Where are you going?” / “I’m going to the school.” Add “Who are you going to see?” / “A teacher.” Lift the flap to check.
Pairs walk to a station, choose a building and perform both questions and answers. The answering child predicts the person, then opens the building flap to confirm. Swap roles and visit another station.`],
 ['Stage 2 · Find a Pair & Picture Dictation',10,'game',`Give each child two building cards and two profession cards; prepare matching word cards. A asks where B is going, and B chooses a building from their hand. A then asks who B will see; B names the matching person. Transfer a matching word card when available and take turns.
For Picture Dictation, give each child a map and profession mini cards. The class asks where you are going; name a destination and ask who they will see.
Children hold up the correct person, say “A pilot”, for example, and place that person beside the airport. Invite a child to lead the next destination and rotate leaders.`],
 ['Showtime · My city map',10,'activity',`Children assemble their map and put each profession beside the correct workplace. Check school–teacher, farm–farmer, hospital–doctor and airport–pilot.
Model the mini-show: choose a character counter, ask the class for the destination question, move the counter and answer. Respond to the person question by pointing to the matching profession.
Invite children to present their maps in the same way. The audience asks both questions, while the presenter chooses the route and answers. Support with the pictures when needed.`],
 ['Wrap-up & assignment',5,'activity',`Review any place/person matches or pronunciation that needed help. Show the Notebook task, then tidy up, reward participation and say goodbye.
Homework: repeat along with the lesson review video; practise “Who are you going to see?” / “A teacher/farmer/doctor/pilot” with a parent; complete Notebook page 50.
Encourage families to use the child’s map or cards as prompts for the exchange.`],
 ]),
 plan(3,'Places & People · Thematic role-play','11–14',69,
 'Name supermarket, fire station, police station and zoo; identify cashier, firefighter, police officer and zookeeper. Ask and answer both city-trip questions.',
 'Session 3 printables; city map; building/profession pictures and word cards; Jake/Pandy puppets; counters; flaps/pouches; flashlights listed in source.',
 'Keep the four place/person pairs visible while children learn the new words. Use the session’s new destinations in games; school/teacher in the source rules are recycled examples.',[
 ['Warm-up',5,'activity',`Welcome children, guide them through the arrival routine and review class rules with movement. Check the previous assignment.
Recall the two familiar questions using a puppet and one known destination: “Where are you going?” and “Who are you going to see?”
Keep this review brief so most of the session is available for the new places and professions.`],
 ['Stage 1 · New building-window stations',10,'activity',`Prepare layered building/profession pictures as in Session 2. Model the new pairs: supermarket–cashier, fire station–firefighter, police station–police officer and zoo–zookeeper.
Use Jake and Pandy to demonstrate the full exchange. Move to a destination, ask both questions and lift the building flap to reveal the matching person.
Pairs choose stations around the classroom. One asks, the other answers with the chosen place and person, then checks underneath the flap. Swap roles and visit another destination.`],
 ['Stage 2 · Find a Pair / Go Fish',10,'game',`Give each child two building cards and two profession cards. Shuffle the remaining picture and word cards into a draw pile.
A asks where B is going. B chooses from their building cards, answers, then responds to “Who are you going to see?” A gives B a matching word card if they hold it; if A has no match, A draws a card and continues the questioning.
Take turns asking and collecting word-to-picture matches. Keep building cards in their owners’ hands rather than exchanging them. Help children use today’s new places and professions, not only the familiar school/teacher example.`],
 ['Showtime · Partner city journeys',10,'activity',`Pairs make a map and place the professions beside their workplaces. Check the matches before rehearsal.
Model with a character counter: the questioner asks where the character is going, the traveller moves the counter and answers, then names the person they will see.
Children choose Jake, Liz, Chuckles or Pandy as a counter and take turns directing a city trip. Swap roles so both children ask and answer both questions. Invite a few pairs to demonstrate.`],
 ['Wrap-up & assignment',5,'activity',`Use one or two place/person pairs to correct the main errors from the games. Review the day’s activity, tidy up, reward participation and say goodbye.
Homework: repeat along with the review video; practise the two questions with supermarket/cashier, fire station/firefighter, police station/police officer and zoo/zookeeper; complete Notebook page 51.
Show the Notebook activity and make sure children can explain one correct match before leaving.`],
 ]),
 plan(4,'Story · A walk through town','15–17',70,
 'Follow and retell Eve and Jake’s town walk in order. Use the friend, next-to, supermarket and hospital lines in a partner role-play.',
 'Session 4 printables; numbered town map; story pictures; Eve/Jake puppets.',
 'Use numbered pictures to support sequence and prompt a missing line without taking over the role-play. Correct the source spelling “hosiptal” to “hospital”.',[
 ['Warm-up',5,'activity',`Welcome children and follow the usual arrival routine. Review the rules with movement and check homework.
Briefly recall the town places and the two city-trip questions using familiar pictures or puppets.
Introduce Eve and Jake’s walk after school and explain that children will later act out the journey with a partner.`],
 ['Stage 1 · Model the story route',10,'activity',`Display the numbered map and story pictures. Use the puppets to act out each stop in sequence, helping children connect the route to what the characters say.
Highlight the key language: going to see a friend; the zoo next to the farm; buying food at the supermarket; not liking visits to the hospital. Include “and you?” in the exchange.
After explaining the pictures, divide the class into an Eve group and a Jake group. Lead a shared retelling with each group speaking its character’s part.`],
 ['Stage 2 · Picture-walk rehearsal',10,'activity',`Place the story pictures in order around the room or along a display. Pair children and give them the Eve and Jake roles.
At each picture, the pair recalls and performs the exchange, then moves to the next picture. Use the numbered map if they lose the sequence.
Support difficult questions with the first words or a puppet prompt. Let the partner respond before moving on, rather than having both children repeat the teacher’s entire dialogue.`],
 ['Showtime · Partner story performance',10,'activity',`Pairs decide who will play each character, then walk through the picture sequence and act out the story. Allow a rehearsal and swap roles.
Invite pairs to perform for the class. Keep the numbered pictures available so the focus is on communicating the journey, not memorising every line without support.
Encourage clear turn-taking and use of the key town phrases. Note recurring errors for a short recap after the performances.`],
 ['Wrap-up & assignment',5,'activity',`Give specific encouragement about the retelling and briefly correct the most useful language point. Tidy the materials and finish the class routine.
Homework: repeat along with the review video; practise “I’m going to see a friend”, “The zoo is next to the farm”, “This is the supermarket. My mom buys food here” and “I don’t like going to the hospital”; complete Notebook page 52.
Encourage children to use the story pictures when practising with a parent.`],
 ]),
 plan(5,'Follow-up · Sounds & word building','17–21',71,
 'Review s, t, p, a, i, n, d, m, g, o, c. Practise oral blending, segmenting and reading sit, pod, gas, mat, pat and am.',
 'Topic 9 Sounds printables; capital/lowercase letter cards; word cards; umbrella/raindrop matching pieces; sticky tack; laminated A3 teeth picture; washable marker; toothbrushes with felt erasers prepared by the teacher.',
 'Distinguish letter names from sounds; model the sounds for blending. “am” is a two-sound word, not CVC. Prepare the printable/yoga resources before class; do not rely on a QR code being available.',[
 ['Warm-up · Sound recall',5,'activity',`Welcome children, review the routine and check the previous assignment. Briefly revisit familiar letters and their sounds.
Introduce today’s review set: s, t, p, a, i, n, d, m, g, o and c. Check which sounds children recall before moving into movement games.
Explain that they will use these sounds to build and read short words. Keep letter-name practice separate from saying the sounds used in blending.`],
 ['Stage 1 · ABC Shapes & Alphabet Yoga',10,'game',`Write capital letters on cards before class. Quietly show a letter to three children, who work together to form its shape with their bodies. The rest of the group guesses; change the children and letter after a correct guess.
For Alphabet Yoga, prepare and cut the letter pieces with sticky tack. Children trace letters in the air using fingers or body movements and say the sounds.
Use the prepared action examples or the source’s QR-linked demonstration if available. Combine the letter actions to sound out a short word, blend it and repeat with other words from the session.`],
 ['Stage 2 · Spring Showers matching & building',10,'activity',`Cut out the umbrella and raindrop pieces before class. Show the raindrop letters and have children say their sounds.
Round 1: distribute the pieces and match uppercase to lowercase letters, or lowercase to uppercase. Check each match aloud.
Round 2: pairs use the letters to build short words. Invite children to build a word on the board while the class sounds it out and blends. Use sit, pod, gas, mat and pat for CVC practice, and am as a shorter blending example; help children who need support choosing or ordering letters.`],
 ['Showtime · Brushing Teeth word hunt',10,'game',`Prepare a laminated teeth picture, ideally A3, and write the target words in different positions with a washable marker. Attach felt to toothbrush heads in advance so they work as small erasers.
Say a word. Children find the written word, read it and “clean” it off with the felt brush. Give turns so every child has a chance to listen, locate and erase.
Re-write words for another round. Revisit a confused word by pointing to each letter, saying its sound and blending before children find it again.`],
 ['Wrap-up & assignment',5,'activity',`Give feedback on blending and segmentation, then revisit one or two words that needed help. Finish with the normal clean-up and goodbye routine.
Homework: repeat along with the review video; practise pronouncing and reading sit, pod, gas, mat, pat and am; complete Notebook page 53.
Show families or children how to point through the sounds and then say the whole word, rather than guessing from its first letter.`],
 ]),
 plan(6,'Follow-up · Review & city diorama','22–23',71,
 'Review city places and professions. Make a town map/diorama and rehearse a mini-show using both city-trip questions.',
 'Topic 9 craft props; map/building/profession pieces; glue and colouring materials; teacher’s sample city; optional puzzles or letter blocks for fast finishers.',
 'Choose review targets from homework and classroom difficulties. Help with construction while keeping the language exchange central; offer a sample map to children who need a model.',[
 ['Warm-up',5,'activity',`Follow the familiar warm-up routine and check the sounds from the previous lesson.
Use a few letter or word cards to notice which blending or sound-recognition points still need attention.
Explain that today children will prepare a town model and practise the language for their mini-show.`],
 ['Stage 1 · Targeted language review',10,'activity',`Use homework and the earlier sessions to identify the most difficult vocabulary, place/person matches or questions for this group.
Revisit those targets through familiar map and card activities rather than repeating every item equally. Model the two questions and an example answer before pair practice.
Check destinations such as zoo, farm, hospital, supermarket and airport with zookeeper, farmer, doctor, cashier and pilot. Give extra practice to the errors that affect children’s mini-show.`],
 ['Stage 2 · Finish the city craft',10,'activity',`Help children complete the Topic 9 town map or city diorama. They draw or assemble their town and place buildings and matching professions on it.
Move around the room, helping with the craft and asking where the child is going and who they will see. Keep the pieces arranged so children can use them as speaking prompts.
For fast finishers, provide a short puzzle or letter-block task, or have an extra conversation about their city while others finish.`],
 ['Showtime preparation · Rehearse the mini-show',10,'activity',`Use your sample city to demonstrate the mini-show. Move a counter to a destination, answer the destination question and identify the person there.
Children rehearse with their own craft, first with teacher support and then with a partner or small audience. Practise clear questions, answers and pointing to the relevant building/person.
Notice which language still needs a prompt and help the child prepare that part for the next session’s performance.`],
 ['Wrap-up & assignment',5,'activity',`Check that each child’s craft and short presentation are ready for showtime. Explain what they should bring or keep safely for the next class.
Tidy up and finish the class routine. Homework: review the unit content and complete Notebook page 54’s activity-sorting task.
Show the Notebook task and give one example so children understand how to complete it independently with family support.`],
 ]),
 plan(7,'Follow-up · Showtime','24–25',72,
 'Present a town map and answer where the traveller is going and who they will see. Listen to classmates’ city presentations.',
 'Children’s city crafts/maps; teacher’s sample for anyone without a craft; building/profession pictures displayed at children’s eye level.',
 'Keep a supportive audience and provide picture prompts as needed. Source heading “6.7” is an obvious carry-over typo; this is City Trip Session 9.7.',[
 ['Warm-up · Drama & homework review',5,'activity',`Begin with a short drama warm-up and revisit the home assignment. Help children get ready to speak to an audience.
Bring out the town crafts or maps and check that every child has a usable display; keep the teacher’s example available for anyone without one.
Explain that the audience will listen for the places and people mentioned in each mini-show.`],
 ['Review · Difficult language',10,'activity',`Use the rehearsals and homework to identify the language that still causes difficulty. Focus the review on those items.
Practise the destination and person questions using the maps, and check any uncertain place/person pairings.
Let children answer with their own town choices. Give prompts or a model where necessary, then ask them to try again with less support.`],
 ['Instruction · Model the presentation',10,'activity',`Place the pictures at children’s eye level. Demonstrate a complete mini-show with your sample town, including the questions, a chosen destination and the person to visit.
Set a clear listening task for the audience, such as noticing the building and profession in the presentation.
Guide children through a final rehearsal with their own craft. Check that they know how to hold or point to the map while speaking and how to wait for a partner’s or audience’s question.`],
 ['Showtime · Present the city',10,'activity',`Invite children to present their mini-shows one by one. Use their town craft, or the teacher’s example, as the visual prompt.
Help the audience ask the two questions and listen for the presenter’s answers. Encourage a clear voice, pointing and turn-taking.
Provide brief prompts when a child gets stuck, keeping the atmosphere supportive. Note useful successes and recurring errors for the final recap.`],
 ['Wrap-up & assignment',5,'activity',`Give encouraging feedback about the children’s performances and briefly revisit the main language errors. Keep the recap focused on improvements they can use next time.
Finish the clean-up and goodbye routine. Homework: practise the content of the mini-show again, paying attention to pronunciation, intonation and speaking pace; review the unit dialogues.
Ask children to use their map as a prompt when presenting to a parent.`],
 ]),
 plan(8,'Follow-up · Evaluation','26–27',73,
 'Ask and answer questions about city places and the people working there in an individual teacher conversation.',
 'Topic 9 Evaluation printables; coloured pens or star stickers; colouring materials for children waiting their turn; another teacher’s support if needed.',
 'Arrange support from the BM/another teacher before class if needed. Source heading “6.8 Good Night” is a carry-over typo; the city context, language and materials identify Session 9.8.',[
 ['Warm-up',5,'activity',`Start with a short drama warm-up and quickly recall the main city-trip questions.
Use familiar destination and profession pictures to establish the context without turning the warm-up into a long drill.
Explain that each child will have a short conversation with the teacher while classmates work on colouring.`],
 ['Review · Focus on difficult items',10,'activity',`Choose the parts children have found most difficult during the unit: a destination word, a profession match or one of the two questions.
Review through familiar pictures and activities, then let children practise asking and answering with a partner.
Keep the examples relevant to the evaluation, such as going to the zoo/farm/hospital/supermarket/airport and seeing a zookeeper/farmer/doctor/cashier/pilot.`],
 ['Instruction · Demonstrate the conversation',5,'activity',`If support is needed, arrange it with the BM or another teacher in advance. Demonstrate the short question-and-answer exchange with that adult.
Show children how they will take turns asking and answering, and explain the colouring task for those waiting.
Set simple expectations for the waiting group so the teacher can hear the individual conversation clearly.`],
 ['Evaluation · Individual conversations',15,'activity',`Invite one child at a time to talk with the teacher. Give the child opportunities both to ask and to answer using the unit’s destination and profession language.
Use the Topic 9 evaluation prompts. Mark the questions the child handles well with a coloured pen or star sticker.
Observe which items are secure and which need further practice, then move to the next child. Complete the evaluation report after class rather than interrupting every exchange with lengthy feedback.`],
 ['Wrap-up & follow-up',5,'activity',`Praise children for their effort and briefly correct the main recurring mistakes. Finish the normal class routine.
Assign extra exercises only for the specific content a child still needs to practise. The source specifies no homework for children who do well in this evaluation session.
After class, complete the evaluation report and use the observations to choose the next review targets.`],
 ]),
];
