export function articleInTopic(a,t){return a.primaryTopicId ? a.primaryTopicId===t.id || (a.additionalTopicIds||[]).includes(t.id) : Boolean(t.domain && a.domain===t.domain);}
