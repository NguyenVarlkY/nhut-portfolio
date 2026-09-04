import TestTodo from '@/components/tools/TestTodo';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bảng điều khiển công việc - Nguyen Bui Nhut Y',
  description: 'Quản lý công việc, lập kế hoạch và phân tích hiệu suất với tích hợp GitHub',
  openGraph: {
    title: 'Bảng điều khiển công việc - Nguyen Bui Nhut Y',
    description: 'Quản lý công việc, lập kế hoạch và phân tích hiệu suất với tích hợp GitHub',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function TodoDashboardPage() {
  return (
    <div className="container-port section-pad">
      <TestTodo />
    </div>
  );
}