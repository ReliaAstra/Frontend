import { VerifyContent } from './verify-content';

export default function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  return <VerifyContent />;
}
