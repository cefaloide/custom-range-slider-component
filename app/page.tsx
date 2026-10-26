import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <div>
        <Link href="/exercise1">Go to Exercise 1</Link>
      </div>
      <div>
        <Link href="/exercise2">Go to Exercise 2</Link>
      </div>
    </div>
  );
}
