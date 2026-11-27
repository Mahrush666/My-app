import type {PlannerBlock,PlannerPlan} from './lesson-planner';

// Published teacher-book summaries are distinct from editable group plans.
export type OfficialPlannerPlan=PlannerPlan&{source:{book:string;pages:string;materials:string;support:string}};
type Stage=[string,number,PlannerBlock['kind'],string];
function plan(id:string,lessonId:string,title:string,pages:string,objectives:string,materials:string,support:string,stages:Stage[]):OfficialPlannerPlan{
 return {kind:'plan',id:'official-pu1-u8-'+id,groupId:'',book:'Power Up 1',unit:8,lessonId,title,date:'',duration:stages.reduce((n,s)=>n+s[1],0),status:'ready',objectives,comments:'',revision:0,updatedAt:0,
 source:{book:'Power Up 1 Teacher’s Book',pages,materials,support},
 blocks:stages.map(([stage,minutes,kind,instructions],i)=>({id:'official-pu1-u8-'+id+'-'+i,stage,minutes,kind,instructions,title:'',resourceId:'',comments:'',url:''}))};
}
export const officialLessonPlans:OfficialPlannerPlan[]=[
 plan('1','pu1-u8-vocabulary1','Lesson 1 · Rooms and objects','TB/PB 94–95; AB 94–95; AB notes TB130',
 'Name rooms and objects. Describe home. Begin the “Invite a friend” mission.',
 'Home/room flashcards; audio 3.13–3.16; unit video; paper.',
 'Support: sentence starters. Extend: draw and label a home.',[
 ['Warm-up & mission',5,'activity','Compare home pictures: size, colour, favourite. Introduce the four mission steps. Complete the home sentence starters (PB94).'],
 ['Introduce vocabulary',8,'activity','Teach bath, bathroom, bed, bedroom, dining room, kitchen, living room, mirror, radio. Mime an action; children identify the room.'],
 ['Listen & identify',10,'activity','PB95: play 3.13 to point; replay and ask who is in each room. Play 3.14 to number; rebuild the flashcard sequence.'],
 ['Chant & movement',5,'song','Play 3.15. Chant and mime. In pairs, one chants and one acts; swap.'],
 ['Listen & say',7,'activity','Play 3.16. Children infer the room from each action. AB95: listen and tick/cross.'],
 ['Sounds & wrap-up',5,'activity','AB95, 4.45–4.46: contrast /ɪ/ in living and /aɪ/ in dining; listen and sort. Finish with quick room/object recall.'],
 ]),
 plan('2','pu1-u8-lesson2','Lesson 2 · What can you do?','TB/PB 96–97; AB 96–97',
 'Ask and answer about ability with can/can’t. Arrange a time for a friend to visit.',
 'Action flashcards; audio/video 3.17; audio 3.18–3.19; stickers; weekend diary grid.',
 'Support: model answers and activity prompts. Extend: groups invent a challenge.',[
 ['Warm-up',5,'game','Draw a household object on a sticky note. Partners identify its room, then change partners.'],
 ['Model can / can’t',6,'activity','Mime an activity you can do and one you can’t. Model “Can you…?” and short answers using action cards.'],
 ['Friendly Farm story',10,'activity','PB96: listen/watch 3.17. Find what Gracie can do. Replay in sections; check meaning and repeat character roles.'],
 ['Grammar practice',8,'activity','PB97: repeat 3.18; hide and recall examples. Listen to 3.19, place stickers and complete sentences.'],
 ['Mission: arrange a visit',8,'activity','Teach weekend mornings, afternoons and evenings. Pairs add activities to a diary grid, then find an available visiting time.'],
 ['Wrap-up',3,'activity','Ask ability questions; children demonstrate one skill. Set AB96–97 practice as needed.'],
 ]),
 plan('3','pu1-u8-vocabulary2','Lesson 3 · Furniture and positions','TB/PB 98–99; AB 98–99',
 'Name furniture. Describe positions with behind, between and in front of. Plan a tidy bedroom.',
 'Furniture/room flashcards; audio/video 3.20, 3.22–3.23; messy-bedroom picture.',
 'Support: point or move objects before speaking. Extend: describe a hidden object’s position.',[
 ['Warm-up',4,'activity','Match household objects to rooms; accept more than one sensible room.'],
 ['Furniture vocabulary',7,'activity','Teach armchair, clock, floor, hall, lamp, painting, phone, rug, sofa. Place cards in appropriate rooms.'],
 ['Song & guessing',8,'song','PB98: listen to 3.20, circle the correct words, then sing. Pairs secretly choose a picture and identify it with position questions.'],
 ['Model positions',6,'activity','Arrange three children to demonstrate between, in front of and behind. Change positions; ask where each child is.'],
 ['Listen & describe',8,'activity','PB99: play 3.22 and identify Sam. Repeat 3.23. Groups change seats and describe their positions.'],
 ['Mission: tidy the bedroom',7,'activity','Groups decide where objects should go in a messy bedroom and report their plan. Review with AB98–99.'],
 ]),
 plan('4','pu1-u8-cross-curricular','Lesson 4 · Houses around the world','TB/PB 100–101; AB 100–101',
 'Identify different homes. Read a description. Write about home and possible activities.',
 'House pictures/video; audio 3.24–3.25; paper.',
 'Support: copy and adapt sentence starters. Extend: write three can and three can’t sentences.',[
 ['Warm-up',4,'activity','Pairs complete “I like my bedroom because…” and share one reason.'],
 ['Explore homes',9,'activity','PB100: watch the video. Teach detached house, flats, houseboat, hut, ranch, stilt-house with 3.24. Discuss local homes and favourites.'],
 ['Listen & number',6,'activity','Play 3.25. Number the homes children want to live in; compare answers in pairs.'],
 ['Read & compare',8,'activity','PB101: predict what David can do at home, then read to check. Compare his houseboat with children’s homes: same or different?'],
 ['Write about home',7,'activity','Use the PB101 frame to describe home, rooms and activities. Partners read each other’s descriptions.'],
 ['Mission: activity list',6,'activity','List what a visiting friend can and can’t do at home. Compare lists with a partner; keep them for the final mission. AB100–101 as needed.'],
 ]),
 plan('5','pu1-u8-reading','Lesson 5 · The clock on the wall','TB/PB 102–103; AB 102–103',
 'Understand and retell a poem. Discuss safe play, consequences, apologies and comforting others.',
 'Poem/audio 3.26; soft ball; activity/place pictures; paper and colouring pencils.',
 'Support: pictures, mimes and model phrases. Extend: act out a new comforting situation.',[
 ['Warm-up',5,'activity','Match games to suitable places: house, park, pool or farm. Discuss where children play.'],
 ['Prepare key words',5,'activity','Demonstrate throw, catch, kick, bounce and hit gently with a soft ball. Clarify mat and ugly using pictures.'],
 ['Read & listen',12,'activity','PB102–103: predict from pictures. Read/listen to 3.26 in sections. Check what the ball hits and whether the clock is OK.'],
 ['Retell & feelings',7,'activity','Retell with mimes. Complete PB103’s feelings task; connect each feeling to an event.'],
 ['Comforting role-play',8,'activity','Discuss respecting others’ things. Practise apologising and responding with “Don’t worry” / “It’s OK”. Draw or act out a short situation.'],
 ['Wrap-up',3,'activity','Name a suitable indoor game and outdoor game. Use AB102–103 for follow-up.'],
 ]),
 plan('listening','pu1-u8-reading','Follow-up · Listening and positions','TB/PB 104; AB 104; AB notes TB131',
 'Identify objects by position and follow listening-and-colouring instructions.',
 'PB104 and AB104 pictures; audio 3.27–3.28 and 4.49; colouring pencils.',
 'Support: practise pointing before colouring. Extend: children give their own position clues.',[
 ['Position hunt',5,'game','Hide unit flashcards. Give position clues; pairs find the correct card.'],
 ['Picture vocabulary',6,'activity','PB104: find and name the objects in the word box. Teach pineapple and milk. Count the pineapples.'],
 ['Listen & point',8,'activity','Play 3.27. Identify each pineapple from its position. Partners take turns describing and pointing.'],
 ['Listen & colour',12,'activity','Play 3.28’s example first. Check colour pencils, then listen and colour. Replay to check positions and colours.'],
 ['Independent practice',6,'activity','Use AB104 with audio 4.49. Children listen and colour the correct cars.'],
 ['Wrap-up',3,'activity','Partners give one new clue about an object. Check both the object and its position.'],
 ]),
 plan('mission','pu1-u8-reading','Follow-up · Invite a friend: mission and review','TB/PB 105; AB 94, 105; AB notes TB131',
 'Welcome a visitor, describe rooms, offer refreshments and suggest activities.',
 'Children’s activity lists; room/furniture cards; AB105 board; dice and counters.',
 'Support: display phrase prompts. Extend: visitors ask extra questions or request food/drink.',[
 ['Recall',5,'activity','Pairs discuss what they like doing when friends visit. Retrieve the activity lists from PB101.'],
 ['Model a visit',7,'activity','Demonstrate greeting at the door, showing rooms, offering food/drink and suggesting a game. Children respond as visitors.'],
 ['Prepare in pairs',6,'activity','Choose rooms to show, refreshments to offer and activities to suggest. Rehearse with phrase prompts.'],
 ['Mission in action',12,'activity','PB105: hosts welcome visitors and act out the visit. Swap roles and repeat.'],
 ['Furniture board game',7,'game','AB105: collect bedroom furniture using dice/counters. On each picture, ask and answer what the player has got.'],
 ['Wrap-up',3,'activity','Recall five new unit words. Complete the AB94 mission diary / can-do reflection.'],
 ]),
];
export function isOfficialPlan(plan:PlannerPlan):plan is OfficialPlannerPlan{
 return officialLessonPlans.some(p=>p.id===plan.id);
}
export function copyPlannerPlan(source:PlannerPlan,groupId:string):PlannerPlan{
 // Explicit fields prevent a copy retaining the Official label or source identity.
 return {kind:'plan',id:crypto.randomUUID(),groupId,lessonId:source.lessonId,book:source.book,unit:source.unit,title:source.title,date:'',duration:source.duration,status:'draft',objectives:source.objectives,
 comments:isOfficialPlan(source)?`Based on ${source.source.book}, ${source.source.pages}. Timings are suggested.\nMaterials: ${source.source.materials}\n${source.source.support}`:source.comments,
 blocks:source.blocks.map(b=>({...b,id:crypto.randomUUID()})),revision:0,updatedAt:0};
}
