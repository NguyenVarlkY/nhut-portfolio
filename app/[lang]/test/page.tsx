import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Test Page',
};

export default function TestPage() {
  return (
    <div>
      <h1>Test Page</h1>
      <p>This is a test page.</p>
    </div>
  );
}