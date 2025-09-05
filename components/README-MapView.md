# Interactive Map View Component

## Tổng quan

Đây là một hệ thống bản đồ tương tác hoàn chỉnh được xây dựng với React + Leaflet, có khả năng hiển thị dữ liệu agencies theo county với fuzzy matching thông minh.

## Cấu trúc Components

### 1. **MapService** (`lib/services/mapService.ts`)
- **Chức năng**: Service layer xử lý logic chính
- **Tính năng**:
  - Load dữ liệu agencies từ database
  - Load GeoJSON data
  - Fuzzy matching với Fuse.js
  - Tính toán statistics
  - Quản lý map styling

### 2. **InteractiveMap** (`components/InteractiveMap.tsx`)
- **Chức năng**: Component chính của map view
- **Tính năng**:
  - Hiển thị bản đồ UK với counties
  - Hover highlighting
  - Click để chọn county
  - Tích hợp sidebar hiển thị agencies

### 3. **AgencySidebar** (`components/AgencySidebar.tsx`)
- **Chức năng**: Sidebar hiển thị danh sách agencies
- **Tính năng**:
  - Hiển thị chi tiết agencies của county được chọn
  - Link đến trang agencies
  - Responsive design
  - Empty state handling

### 4. **MapLegend** (`components/MapLegend.tsx`)
- **Chức năng**: Legend và thống kê
- **Tính năng**:
  - Giải thích màu sắc
  - Hiển thị statistics
  - Compact design

### 5. **MapInstructions** (`components/MapInstructions.tsx`)
- **Chức năng**: Hướng dẫn sử dụng
- **Tính năng**:
  - Instructions ngắn gọn
  - User-friendly

## Cách sử dụng

### Basic Usage
```tsx
import InteractiveMap from '@/components/InteractiveMap';

export default function MapPage() {
  return (
    <div className="w-full h-screen">
      <InteractiveMap />
    </div>
  );
}
```

### Advanced Usage với Custom API Client
```tsx
import InteractiveMap from '@/components/InteractiveMap';
import { createClient } from '@/lib/supabase/client';

export default function MapPage() {
  const apiClient = createClient();
  
  return (
    <div className="w-full h-screen">
      <InteractiveMap 
        apiClient={apiClient}
        geoJsonUrl="/custom/path/to/geojson.json"
      />
    </div>
  );
}
```

## Tính năng chính

### 1. **Fuzzy Matching**
- Sử dụng Fuse.js với threshold 0.4
- Xử lý các trường hợp:
  - "County Durham" ↔ "Durham County"
  - "Greater Manchester" ↔ "Manchester"
  - "Inner London" ↔ "London"
  - Các biến thể khác

### 2. **Interactive Features**
- **Hover**: Highlight county và hiển thị tooltip
- **Click**: Chọn county và hiển thị agencies trong sidebar
- **Responsive**: Tương thích mọi kích thước màn hình

### 3. **Data Visualization**
- **Màu xanh**: Counties có agencies
- **Màu xám**: Counties không có agencies
- **Màu amber**: County đang hover
- **Statistics**: Hiển thị tổng quan dữ liệu

### 4. **Performance**
- Dynamic imports để tránh SSR issues
- Lazy loading components
- Efficient re-rendering
- Canvas renderer cho Leaflet

## API Interface

### MapService Methods
```typescript
// Load dữ liệu
await mapService.loadAgencies(apiClient);
await mapService.loadGeoJSON(geoJsonUrl);

// Fuzzy matching
const matchedCounty = mapService.fuzzyMatchCounty(geoJsonName);

// Get agencies
const agencies = mapService.getAgenciesForCounty(countyName);

// Get statistics
const stats = mapService.getStatistics();

// Get map style
const style = mapService.getMapStyle(feature, isHovered);
```

### Component Props
```typescript
interface InteractiveMapProps {
  geoJsonUrl?: string;        // URL đến GeoJSON file
  apiClient?: any;           // API client (Supabase, etc.)
}
```

## Customization

### 1. **Thay đổi API Backend**
```typescript
// Tạo custom API client
const customApiClient = {
  from: (table: string) => ({
    select: (fields: string) => ({
      // Custom implementation
    })
  })
};

<InteractiveMap apiClient={customApiClient} />
```

### 2. **Thay đổi GeoJSON Source**
```typescript
<InteractiveMap geoJsonUrl="/custom/geojson.json" />
```

### 3. **Customize Styling**
Chỉnh sửa `getMapStyle()` method trong MapService:
```typescript
getMapStyle(feature: CountyFeature, isHovered: boolean = false): MapStyle {
  return {
    fillColor: isHovered ? "#custom-hover-color" : "#custom-color",
    // ... other style properties
  };
}
```

## Dependencies

- **React**: UI framework
- **Leaflet**: Map library
- **React-Leaflet**: React wrapper cho Leaflet
- **Fuse.js**: Fuzzy search library
- **Next.js**: Framework (dynamic imports)
- **Tailwind CSS**: Styling

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance Tips

1. **GeoJSON Size**: Giữ file GeoJSON < 10MB
2. **Agency Count**: Tối ưu cho < 10,000 agencies
3. **Caching**: Implement caching cho API calls
4. **Lazy Loading**: Sử dụng dynamic imports

## Troubleshooting

### Common Issues

1. **Map không hiển thị**: Kiểm tra GeoJSON URL và format
2. **Agencies không match**: Kiểm tra fuzzy matching threshold
3. **Performance chậm**: Giảm kích thước GeoJSON hoặc số lượng agencies
4. **SSR Issues**: Đảm bảo sử dụng dynamic imports

### Debug Mode
Bật console logging để debug:
```typescript
// Trong MapService
console.log(`Matching "${geoJsonName}" -> "${matchedCounty}"`);
```

## Future Enhancements

- [ ] Clustering cho agencies
- [ ] Search functionality
- [ ] Export data
- [ ] Multiple map layers
- [ ] Real-time updates
- [ ] Mobile optimization
