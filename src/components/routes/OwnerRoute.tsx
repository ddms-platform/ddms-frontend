import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { routeName } from '@/constants/route-name';

interface OwnerRouteProps {
  redirectPath?: string;
}

/**
 * Route guard cho khu vực chủ thuyền.
 *
 * Vai trò `owner` chỉ được cấp khi cảng vụ duyệt hồ sơ. Nhưng thuyền đã được
 * tạo ngay từ lúc nộp hồ sơ, nên nếu chỉ xét vai trò thì trong khoảng chờ duyệt
 * chủ thuyền bị đá về trang chủ và tưởng thuyền đã khai bị mất — rồi đi khai
 * lại một chiếc nữa. Vì vậy cho vào luôn khi hồ sơ đang chờ duyệt; server chặn
 * phần ghi (xem OwnerAreaHandler phía backend).
 */
export default function OwnerRoute({
  redirectPath = routeName.signIn,
}: OwnerRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  const isOwner = user?.roles.includes('owner') ?? false;
  const dangChoDuyet =
    user?.hasOwnerProfile === true && user?.ownerProfileStatus === 'pending';

  if (!isOwner && !dangChoDuyet) {
    return <Navigate to={routeName.home} replace />;
  }

  return <Outlet />;
}
