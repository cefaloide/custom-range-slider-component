import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <div>
        <Link href="/exercice1">Go to Exercice 1</Link>
      </div>
      <div>
        <Link href="/exercice2">Go to Exercice 2</Link>
      </div>
    </div>
  );
}