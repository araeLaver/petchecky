/* eslint-disable @typescript-eslint/no-explicit-any */

declare namespace kakao.maps {
  class Map {
    constructor(container: HTMLElement, options: MapOptions);
    setCenter(latlng: LatLng): void;
    getCenter(): LatLng;
    setLevel(level: number): void;
    getLevel(): number;
  }

  interface MapOptions {
    center: LatLng;
    level?: number;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
    getPosition(): LatLng;
  }

  interface MarkerOptions {
    map?: Map;
    position: LatLng;
    title?: string;
    image?: MarkerImage;
  }

  class MarkerImage {
    constructor(src: string, size: Size, options?: MarkerImageOptions);
  }

  interface MarkerImageOptions {
    offset?: Point;
  }

  class Size {
    constructor(width: number, height: number);
  }

  class Point {
    constructor(x: number, y: number);
  }

  class InfoWindow {
    constructor(options: InfoWindowOptions);
    open(map: Map, marker: Marker): void;
    close(): void;
    setContent(content: string): void;
  }

  interface InfoWindowOptions {
    content?: string;
    removable?: boolean;
  }

  class CustomOverlay {
    constructor(options: CustomOverlayOptions);
    setMap(map: Map | null): void;
  }

  interface CustomOverlayOptions {
    map?: Map;
    position: LatLng;
    content: string | HTMLElement;
    yAnchor?: number;
  }

  namespace event {
    function addListener(target: any, type: string, callback: () => void): void;
    function removeListener(target: any, type: string, callback: () => void): void;
  }

  namespace services {
    class Places {
      constructor();
      keywordSearch(
        keyword: string,
        callback: (result: PlaceSearchResult[], status: Status, pagination: Pagination) => void,
        options?: PlaceSearchOptions
      ): void;
    }

    enum Status {
      OK = "OK",
      ZERO_RESULT = "ZERO_RESULT",
      ERROR = "ERROR",
    }

    interface Pagination {
      totalCount: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      current: number;
      gotoPage(page: number): void;
      nextPage(): void;
      prevPage(): void;
    }

    interface PlaceSearchResult {
      id: string;
      place_name: string;
      category_name: string;
      category_group_code: string;
      category_group_name: string;
      address_name: string;
      road_address_name: string;
      phone: string;
      x: string;
      y: string;
      distance: string;
      place_url: string;
    }

    interface PlaceSearchOptions {
      location?: LatLng;
      radius?: number;
      size?: number;
      page?: number;
      sort?: "distance" | "accuracy";
    }
  }

  function load(callback: () => void): void;
}

interface Window {
  kakao: typeof kakao;
}
