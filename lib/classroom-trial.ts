// A separate, explicitly selected route to the same classroom. Never auto-enable it.
export const trialClassroomEndpoint='https://wordquest-young-learners.makhmetshin1907.chatgpt.site/classroom-relay';
export function classroomTrialSelected(search=typeof location==='undefined'?'':location.search){return new URLSearchParams(search).get('classroom-route')==='trial'}
export function classroomEndpointForPage(primary:string,search?:string){return classroomTrialSelected(search)?trialClassroomEndpoint:primary}
export function preserveClassroomTrial(url:string,search=typeof location==='undefined'?'':location.search){if(!classroomTrialSelected(search))return url;const target=new URL(url,typeof location==='undefined'?'https://mahrush666.github.io':location.href);target.searchParams.set('classroom-route','trial');return target.pathname+target.search+target.hash}
