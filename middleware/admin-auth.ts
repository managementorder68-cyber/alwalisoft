import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin authentication middleware
 * This is a placeholder - you should implement proper authentication
 */

// في الإنتاج، يجب تغيير هذا إلى نظام أمان حقيقي
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'change-this-secret-in-production';

export function checkAdminAuth(req: NextRequest): boolean {
  // Check for admin token in headers or cookies
  const authHeader = req.headers.get('authorization');
  const adminToken = req.cookies.get('admin_token')?.value;

  // في التطوير، نسمح بالوصول بدون authentication
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // Check if valid admin token
  if (authHeader === `Bearer ${ADMIN_SECRET}` || adminToken === ADMIN_SECRET) {
    return true;
  }

  return false;
}

export function requireAdminAuth(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    if (!checkAdminAuth(req)) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - Admin access required',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    return handler(req, ...args);
  };
}

export function createAdminMiddleware() {
  return (req: NextRequest) => {
    // Check if this is an admin route
    const pathname = req.nextUrl.pathname;
    
    if (pathname.startsWith('/api/admin') || pathname.startsWith('/admin')) {
      if (!checkAdminAuth(req)) {
        // Redirect to login page for admin UI
        if (pathname.startsWith('/admin') && !pathname.includes('/login')) {
          return NextResponse.redirect(new URL('/admin/login', req.url));
        }
        
        // Return 401 for API routes
        if (pathname.startsWith('/api/admin')) {
          return NextResponse.json({
            success: false,
            error: 'Unauthorized',
            code: 'UNAUTHORIZED'
          }, { status: 401 });
        }
      }
    }

    return NextResponse.next();
  };
}
