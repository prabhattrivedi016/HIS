import {
  Children,
  cloneElement,
  isValidElement,
  ReactNode,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

interface ScrollspyChildProps {
  "data-scrollspy-anchor"?: string;
  isActive?: boolean;
  onSelect?: () => void;
  onClick?: (e: React.MouseEvent) => void;
}

interface ScrollspyProps {
  targetRef: RefObject<HTMLElement | null>;
  offset?: number;
  className?: string;
  children: ReactNode;
  onActiveChange?: (id: string) => void;
}

export const Scrollspy = ({
  targetRef,
  offset = 0,
  className,
  children,
  onActiveChange,
}: ScrollspyProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const anchorIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (activeId) onActiveChange?.(activeId);
  }, [activeId]);

  useEffect(() => {
    const root = targetRef.current;
    if (!root) return;

    const update = () => {
      const rootTop = root.getBoundingClientRect().top;
      let current = anchorIdsRef.current[0] ?? null;
      anchorIdsRef.current.forEach(id => {
        const el = root.querySelector<HTMLElement>(`#${id}`);
        if (el && el.getBoundingClientRect().top - rootTop <= offset) current = id;
      });
      setActiveId(current);
    };
    // update();
    update();
    root.addEventListener("scroll", update, { passive: true });
    return () => root.removeEventListener("scroll", update);
  }, [targetRef, offset, children]);

  const scrollToAnchor = (id: string) => {
    setActiveId(id);
    targetRef.current
      ?.querySelector(`#${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const anchorIds: string[] = [];
  const rendered = Children.map(children, child => {
    if (!isValidElement<ScrollspyChildProps>(child)) return child;
    const anchorId = child.props["data-scrollspy-anchor"];
    if (!anchorId) return child;

    anchorIds.push(anchorId);
    return cloneElement(child, {
      isActive: activeId === anchorId,
      onSelect: () => scrollToAnchor(anchorId),
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        scrollToAnchor(anchorId);
      },
    });
  });
  anchorIdsRef.current = anchorIds;

  return <div className={className}>{rendered}</div>;
};

export default Scrollspy;
