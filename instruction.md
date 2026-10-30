Create the entire frontend prototype for "Dhammika Motor Suppliers" inside this Next.js 15 (App Router, TypeScript, Tailwind CSS) project using mock/dummy data.

This application is strictly a Digital Parts Catalog for mobile-browsing customers and an Admin Portal for the owner to manage inventory and export category-specific printable PDFs.

No shopping cart, no checkout, and no WhatsApp ordering buttons.

---

### Key Requirements

#### 1. Mock Data Setup (`data/mockData.ts`)
Define TypeScript interfaces and populate realistic data:
```typescript
export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface AutoPart {
  id: string;
  partNumber: string;
  name: string;
  categoryId: string;
  categoryName: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
}

Populate at least 15 auto parts across 4–5 categories ("Brake Parts", "Engine & Filters", "Suspension & Steering", "Clutch & Transmission", "Electrical"). Use realistic part numbers (e.g., #TY-BRK-4091, #NIS-FLT-15208), clear names (e.g., "Front Brake Pads - Hilux KDH", "Oil Filter Element - Prado"), realistic Sri Lankan Rupee pricing (Rs. 4,500), and stable placeholder automotive images (e.g., Unsplash).

2. Mobile-First Customer Catalog (app/page.tsx)
Target audience: Vehicle repair shopkeepers using mobile smartphones.

No user accounts or login for customers.

Sticky Top Bar:

Business branding: "Dhammika Motor Suppliers" with subtitle "Auto Parts Catalog".

Fast search input that searches both Part Name and Part Number in real time, with an instant clear ("X") button.

Horizontal swipeable category ribbon ("All" + each category) with touch scrolling and active state highlighting.

Total count indicator (e.g., "Showing 8 parts in Brake Parts").

Product Feed / Card Layout:

Optimized for small screens: single-column card list on mobile (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4).

Each card must display:

Product Image: Square 85x85px or 90x90px thumbnail with tap-to-expand image modal.

Category name badge.

Part Name: Bold, clear, high-contrast text.

Part Number: Highlighted monospace badge (e.g., #TY-BRK-4091).

Price: Prominent bold text (e.g., Rs. 4,500.00).

Availability status pill ("In Stock" / "Out of Stock").

Discreet footer link: "Admin Login".

3. Admin Dashboard (app/admin/login/page.tsx & app/admin/page.tsx)
Simple login screen accepting any test PIN or password to access /admin.

In-memory React state for full CRUD:

Add / Edit Part Modal: Form with inputs for Part Name, Part Number, Category (dropdown with quick new category creation), Price, and Image URL.

Add Category Modal: Add a new category to the system.

Inventory List/Table: Quick actions to edit details/prices, toggle stock availability, or delete parts.

Link back to "Customer Catalog View".

4. Category-Wise PDF Generator (components/CategoryPdfExport.tsx)
Install and use jspdf and jspdf-autotable.

Available in the Admin panel via a "📄 Download Category PDF" button.

Modal allows selecting any specific category (or "All Categories").

Generates a clean, printable A4 PDF:

Header: Dhammika Motor Suppliers, Category Title, and generated date.

Table: Row #, Part Number, Item Name, and Price (LKR).

Clean borders, readable row padding, alternating row colors, and "Page X of Y" pagination.

Downloads cleanly as Dhammika_Motor_Suppliers_[CategoryName].pdf.

Execution Instructions
Install dependencies: npm install lucide-react clsx tailwind-merge jspdf jspdf-autotable.

Ensure touch targets are at least 44px and input font sizes are >= 16px to prevent iOS auto-zoom.

Configure next.config.ts with images.remotePatterns for external image domains (e.g., images.unsplash.com).

Run npm run build and ensure there are zero TypeScript or linting errors.