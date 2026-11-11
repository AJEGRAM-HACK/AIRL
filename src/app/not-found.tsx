import Link from 'next/link';
import { Nav } from '@/components/nav';
export default function NotFound(){return <><Nav/><main id="main" className="not-found"><div className="eyebrow">SCENE NOT FOUND / 404</div><h1>This story hasn’t<br/>been written yet.</h1><p>The prototype room and universe are both named barangay-2099.</p><Link className="button button-primary" href="/">Back to the opening scene</Link></main></>;}
