import Link from "next/link";

export default function Header() {
  return (
    <header className="flex justify-between p-4 bg-black text-white">
      <Link href="/" className="font-bold">Journal</Link>
      <nav className="space-x-4">
        <Link href="/teaching">Teaching</Link>
        <Link href="/training">Training</Link>
        <Link href="/research">Research</Link>
      </nav>
    </header>
  );
}
