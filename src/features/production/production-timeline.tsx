import { Check, Circle, LoaderCircle, TriangleAlert } from 'lucide-react';
import { Stages } from '@/server/production/schemas';

type StageEvent = { stage: string; status: string };
export type ProductionState = {
  status: string;
  mode: string;
  progress?: StageEvent | null;
  events?: StageEvent[];
};
const descriptions = ['Shapes the direction', 'Writes the scenes', 'Builds the visual episode', 'Checks story and continuity'];
const stageNames: Record<string, string> = { Director: 'Story Director', Screenwriter: 'Screenwriter', 'Visual Producer': 'Visual Producer', 'Creative Critic': 'Creative Critic' };
const statusNames: Record<string, string> = { queued: 'In the queue', running: 'Creating', review: 'In review', published: 'Published', failed: 'Needs attention', rejected: 'Not published' };
const headlines: Record<string, string> = {
  queued: 'Your next chapter is queued.', running: 'A story is taking shape.',
  review: 'Created. Ready for human review.', published: 'The next chapter is here.',
  failed: 'Production needs attention.', rejected: 'This draft will not be published.',
};

// Public reads expose only the latest stage. Never invent per-stage event history.
export function ProductionTimeline({ job }: { job: ProductionState }) {
  const finished = ['review', 'published', 'rejected'].includes(job.status);
  return <section className="production-progress" aria-label="Episode production" data-status={job.status}>
    <div className="production-progress-heading"><p className="eyebrow">{job.mode === 'demo' ? 'DEMO WORKFLOW · DETERMINISTIC TEMPLATES' : 'FROM COMMUNITY CHOICE TO EPISODE'}</p><span className="state-label">{statusNames[job.status] || 'Production update'}</span></div>
    <h2 key={job.status}>{headlines[job.status] || 'Production update'}</h2>
    <p className="production-update" role="status"><span key={`${job.status}-${job.progress?.stage}-${job.progress?.status}`}>{job.progress ? `${stageNames[job.progress.stage] || job.progress.stage} · ${job.progress.status === 'started' ? 'Creating this chapter' : job.progress.status === 'succeeded' ? 'Stage complete' : job.progress.status === 'failed' ? 'Production paused' : 'Update received'}` : job.status === 'queued' ? 'Your chapter will begin when production is ready.' : headlines[job.status] || 'Production update'}</span></p>
    <ol className="production-stages" aria-label="Recorded production stages">
      {Stages.map((stage, index) => {
        const recorded = job.events?.filter(event => event.stage === stage).at(-1);
        const latest = recorded || (job.progress?.stage === stage ? job.progress : undefined);
        const state = finished || latest?.status === 'succeeded' ? 'complete'
          : latest?.status === 'failed' ? 'failed'
          : latest?.status === 'started' && job.status === 'running' ? 'working' : 'waiting';
        const Icon = state === 'complete' ? Check : state === 'failed' ? TriangleAlert : state === 'working' ? LoaderCircle : Circle;
        return <li key={stage} data-stage={stage} data-state={state} aria-current={state === 'working' ? 'step' : undefined}>
          <span className="stage-marker"><Icon size={17} aria-hidden="true" /></span>
          <div><small>0{index + 1}</small><h3>{stageNames[stage] || stage}</h3><p>{descriptions[index]}</p><span className="stage-state">{state === 'complete' ? 'Complete' : state === 'failed' ? 'Stopped' : state === 'working' ? 'In progress' : 'Awaiting update'}</span></div>
        </li>;
      })}
    </ol>
    {job.status === 'review' && <p className="fine-print">A creator reviews the draft before it reaches the audience.</p>}
    {job.status === 'failed' && <p className="fine-print">The creator can inspect the recorded error and retry in Studio. Recorded audience votes are preserved.</p>}
  </section>;
}
