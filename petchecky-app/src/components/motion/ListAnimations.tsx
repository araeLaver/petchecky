"use client";

import { ReactNode, Children, cloneElement, isValidElement } from "react";
import { motion, AnimatePresence, Variants, Reorder } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/useAccessibility";

// ============================================
// 리스트 애니메이션 Variants
// ============================================

export const listVariants = {
  stagger: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
    exit: { opacity: 0 },
  },
  staggerFast: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.05,
      },
    },
    exit: { opacity: 0 },
  },
  staggerSlow: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
    exit: { opacity: 0 },
  },
} as const;

export const itemVariants = {
  fadeUp: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 400, damping: 20 },
    },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  },
  pop: {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 500, damping: 25 },
    },
    exit: { opacity: 0, scale: 0, transition: { duration: 0.15 } },
  },
} as const;

export type ListVariant = keyof typeof listVariants;
export type ItemVariant = keyof typeof itemVariants;

// ============================================
// AnimatedList 컴포넌트
// ============================================

interface AnimatedListProps<T> {
  items: T[];
  keyExtractor: (item: T, index: number) => string | number;
  renderItem: (item: T, index: number) => ReactNode;
  listVariant?: ListVariant;
  itemVariant?: ItemVariant;
  className?: string;
  itemClassName?: string;
  as?: "ul" | "ol" | "div";
}

/**
 * 아이템에 stagger 애니메이션이 적용되는 리스트
 *
 * @example
 * ```tsx
 * <AnimatedList
 *   items={pets}
 *   keyExtractor={(pet) => pet.id}
 *   renderItem={(pet) => <PetCard pet={pet} />}
 *   listVariant="stagger"
 *   itemVariant="fadeUp"
 * />
 * ```
 */
export function AnimatedList<T>({
  items,
  keyExtractor,
  renderItem,
  listVariant = "stagger",
  itemVariant = "fadeUp",
  className,
  itemClassName,
  as = "ul",
}: AnimatedListProps<T>) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const Component = as;
  const ItemComponent = as === "ul" || as === "ol" ? "li" : "div";

  if (prefersReducedMotion) {
    return (
      <Component className={className}>
        {items.map((item, index) => (
          <ItemComponent key={keyExtractor(item, index)} className={itemClassName}>
            {renderItem(item, index)}
          </ItemComponent>
        ))}
      </Component>
    );
  }

  return (
    <motion.div
      className={className}
      variants={listVariants[listVariant]}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={keyExtractor(item, index)}
            variants={itemVariants[itemVariant]}
            layout
            className={itemClassName}
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// AnimatedGrid 컴포넌트
// ============================================

interface AnimatedGridProps<T> {
  items: T[];
  keyExtractor: (item: T, index: number) => string | number;
  renderItem: (item: T, index: number) => ReactNode;
  columns?: 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  itemVariant?: ItemVariant;
  className?: string;
}

const gridColumns = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

const gridGaps = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
};

/**
 * 그리드 레이아웃의 애니메이션 리스트
 *
 * @example
 * ```tsx
 * <AnimatedGrid
 *   items={photos}
 *   keyExtractor={(photo) => photo.id}
 *   renderItem={(photo) => <PhotoCard photo={photo} />}
 *   columns={3}
 * />
 * ```
 */
export function AnimatedGrid<T>({
  items,
  keyExtractor,
  renderItem,
  columns = 3,
  gap = "md",
  itemVariant = "scale",
  className,
}: AnimatedGridProps<T>) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={`grid ${gridColumns[columns]} ${gridGaps[gap]} ${className}`}>
        {items.map((item, index) => (
          <div key={keyExtractor(item, index)}>{renderItem(item, index)}</div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={`grid ${gridColumns[columns]} ${gridGaps[gap]} ${className}`}
      variants={listVariants.stagger}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={keyExtractor(item, index)}
            variants={itemVariants[itemVariant]}
            layout
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// ReorderList 컴포넌트
// ============================================

interface ReorderListProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  keyExtractor: (item: T) => string | number;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  itemClassName?: string;
  axis?: "x" | "y";
}

/**
 * 드래그로 재정렬 가능한 리스트
 *
 * @example
 * ```tsx
 * <ReorderList
 *   items={tasks}
 *   onReorder={setTasks}
 *   keyExtractor={(task) => task.id}
 *   renderItem={(task) => <TaskItem task={task} />}
 * />
 * ```
 */
export function ReorderList<T>({
  items,
  onReorder,
  keyExtractor,
  renderItem,
  className,
  itemClassName,
  axis = "y",
}: ReorderListProps<T>) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={className}>
        {items.map((item, index) => (
          <div key={keyExtractor(item)} className={itemClassName}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <Reorder.Group
      axis={axis}
      values={items}
      onReorder={onReorder}
      className={className}
    >
      {items.map((item, index) => (
        <Reorder.Item
          key={keyExtractor(item)}
          value={item}
          className={`cursor-grab active:cursor-grabbing ${itemClassName}`}
          whileDrag={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.12)" }}
        >
          {renderItem(item, index)}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}

// ============================================
// AnimatedCard 컴포넌트
// ============================================

interface AnimatedCardProps {
  children: ReactNode;
  hoverScale?: number;
  hoverY?: number;
  hoverShadow?: string;
  tapScale?: number;
  onClick?: () => void;
  className?: string;
  layoutId?: string;
}

/**
 * 호버/탭 애니메이션이 적용된 카드
 *
 * @example
 * ```tsx
 * <AnimatedCard
 *   hoverScale={1.02}
 *   hoverY={-4}
 *   onClick={() => navigate(`/pet/${pet.id}`)}
 * >
 *   <PetInfo pet={pet} />
 * </AnimatedCard>
 * ```
 */
export function AnimatedCard({
  children,
  hoverScale = 1.02,
  hoverY = -4,
  hoverShadow = "0 10px 40px rgba(0,0,0,0.12)",
  tapScale = 0.98,
  onClick,
  className,
  layoutId,
}: AnimatedCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={className} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      layoutId={layoutId}
      className={className}
      onClick={onClick}
      whileHover={{
        scale: hoverScale,
        y: hoverY,
        boxShadow: hoverShadow,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: tapScale }}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// FlipCard 컴포넌트
// ============================================

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  isFlipped: boolean;
  onFlip?: () => void;
  width?: string | number;
  height?: string | number;
  className?: string;
}

/**
 * 앞/뒤 뒤집기 카드
 *
 * @example
 * ```tsx
 * <FlipCard
 *   front={<CardFront />}
 *   back={<CardBack />}
 *   isFlipped={showDetails}
 *   onFlip={() => setShowDetails(!showDetails)}
 * />
 * ```
 */
export function FlipCard({
  front,
  back,
  isFlipped,
  onFlip,
  width,
  height,
  className,
}: FlipCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div
        className={className}
        style={{ width, height }}
        onClick={onFlip}
      >
        {isFlipped ? back : front}
      </div>
    );
  }

  return (
    <div
      className={`perspective-1000 ${className}`}
      style={{ width, height }}
      onClick={onFlip}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        <div
          className="absolute inset-0 backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          {front}
        </div>
        <div
          className="absolute inset-0 backface-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
}

// ============================================
// ExpandableCard 컴포넌트
// ============================================

interface ExpandableCardProps {
  children: ReactNode;
  expandedContent: ReactNode;
  isExpanded: boolean;
  onToggle?: () => void;
  className?: string;
}

/**
 * 확장 가능한 카드
 *
 * @example
 * ```tsx
 * <ExpandableCard
 *   isExpanded={isOpen}
 *   onToggle={() => setIsOpen(!isOpen)}
 *   expandedContent={<DetailContent />}
 * >
 *   <SummaryContent />
 * </ExpandableCard>
 * ```
 */
export function ExpandableCard({
  children,
  expandedContent,
  isExpanded,
  onToggle,
  className,
}: ExpandableCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={className} onClick={onToggle}>
        {children}
        {isExpanded && <div>{expandedContent}</div>}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      onClick={onToggle}
      layout
      transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div layout="position">{children}</motion.div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {expandedContent}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// SwipeableCard 컴포넌트
// ============================================

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  threshold?: number;
  className?: string;
}

/**
 * 스와이프 동작이 가능한 카드
 *
 * @example
 * ```tsx
 * <SwipeableCard
 *   onSwipeLeft={() => deleteItem(id)}
 *   onSwipeRight={() => archiveItem(id)}
 *   leftAction={<DeleteIcon />}
 *   rightAction={<ArchiveIcon />}
 * >
 *   <CardContent />
 * </SwipeableCard>
 * ```
 */
export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  threshold = 100,
  className,
}: SwipeableCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {leftAction && (
        <div className="absolute inset-y-0 left-0 flex items-center px-4 bg-red-500 text-white">
          {leftAction}
        </div>
      )}
      {rightAction && (
        <div className="absolute inset-y-0 right-0 flex items-center px-4 bg-green-500 text-white">
          {rightAction}
        </div>
      )}
      <motion.div
        className="relative bg-white"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDragEnd={(_, info) => {
          if (info.offset.x < -threshold && onSwipeLeft) {
            onSwipeLeft();
          } else if (info.offset.x > threshold && onSwipeRight) {
            onSwipeRight();
          }
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ============================================
// MasonryGrid 컴포넌트
// ============================================

interface MasonryGridProps<T> {
  items: T[];
  keyExtractor: (item: T, index: number) => string | number;
  renderItem: (item: T, index: number) => ReactNode;
  columns?: 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Masonry 레이아웃 그리드
 * CSS columns 기반으로 동작
 *
 * @example
 * ```tsx
 * <MasonryGrid
 *   items={photos}
 *   keyExtractor={(photo) => photo.id}
 *   renderItem={(photo) => <PhotoCard photo={photo} />}
 *   columns={3}
 * />
 * ```
 */
export function MasonryGrid<T>({
  items,
  keyExtractor,
  renderItem,
  columns = 3,
  gap = "md",
  className,
}: MasonryGridProps<T>) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const gapValue = gap === "sm" ? "0.5rem" : gap === "md" ? "1rem" : "1.5rem";

  if (prefersReducedMotion) {
    return (
      <div
        className={className}
        style={{
          columnCount: columns,
          columnGap: gapValue,
        }}
      >
        {items.map((item, index) => (
          <div
            key={keyExtractor(item, index)}
            style={{ breakInside: "avoid", marginBottom: gapValue }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={{
        columnCount: columns,
        columnGap: gapValue,
      }}
      variants={listVariants.stagger}
      initial="hidden"
      animate="visible"
    >
      {items.map((item, index) => (
        <motion.div
          key={keyExtractor(item, index)}
          variants={itemVariants.fadeUp}
          style={{ breakInside: "avoid", marginBottom: gapValue }}
        >
          {renderItem(item, index)}
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============================================
// InfiniteScrollList 컴포넌트
// ============================================

interface InfiniteScrollListProps<T> {
  items: T[];
  keyExtractor: (item: T, index: number) => string | number;
  renderItem: (item: T, index: number) => ReactNode;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  loadingComponent?: ReactNode;
  itemVariant?: ItemVariant;
  className?: string;
}

/**
 * 무한 스크롤 리스트
 *
 * @example
 * ```tsx
 * <InfiniteScrollList
 *   items={posts}
 *   keyExtractor={(post) => post.id}
 *   renderItem={(post) => <PostCard post={post} />}
 *   onLoadMore={loadMorePosts}
 *   hasMore={hasNextPage}
 *   loading={isLoading}
 * />
 * ```
 */
export function InfiniteScrollList<T>({
  items,
  keyExtractor,
  renderItem,
  onLoadMore,
  hasMore = false,
  loading = false,
  loadingComponent,
  itemVariant = "fadeUp",
  className,
}: InfiniteScrollListProps<T>) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={className}>
        {items.map((item, index) => (
          <div key={keyExtractor(item, index)}>{renderItem(item, index)}</div>
        ))}
        {loading && (loadingComponent || <div>Loading...</div>)}
        {hasMore && !loading && (
          <button onClick={onLoadMore}>Load more</button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      variants={listVariants.stagger}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={keyExtractor(item, index)}
            variants={itemVariants[itemVariant]}
            layout
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </AnimatePresence>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {loadingComponent || <div className="text-center py-4">Loading...</div>}
        </motion.div>
      )}

      {hasMore && !loading && (
        <motion.button
          onClick={onLoadMore}
          className="w-full py-3 text-blue-600 hover:text-blue-700"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Load more
        </motion.button>
      )}
    </motion.div>
  );
}
