import { Dashboard } from '@/components/Dashboard';
import { Nav } from '@/components/Nav';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      <Nav />
      <main className="flex-1 flex flex-col">
        <Dashboard />
      </main>
    </div>
  );
}
