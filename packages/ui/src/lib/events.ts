type TypedEventKind<T extends EventTarget, E extends Event> = E & { currentTarget: T }

export type TypedEvent<T extends EventTarget> = TypedEventKind<T, Event>
export type TypedMouseEvent<T extends EventTarget> = TypedEventKind<T, MouseEvent>
export type TypedKeyboardEvent<T extends EventTarget> = TypedEventKind<T, KeyboardEvent>
export type TypedFocusEvent<T extends EventTarget> = TypedEventKind<T, FocusEvent>
export type TypedTouchEvent<T extends EventTarget> = TypedEventKind<T, TouchEvent>
export type TypedWheelEvent<T extends EventTarget> = TypedEventKind<T, WheelEvent>
export type TypedPointerEvent<T extends EventTarget> = TypedEventKind<T, PointerEvent>
export type TypedDragEvent<T extends EventTarget> = TypedEventKind<T, DragEvent>
export type TypedClipboardEvent<T extends EventTarget> = TypedEventKind<T, ClipboardEvent>
export type TypedInputEvent<T extends EventTarget> = TypedEventKind<T, InputEvent>
export type TypedUIEvent<T extends EventTarget> = TypedEventKind<T, UIEvent>
export type TypedCompositionEvent<T extends EventTarget> = TypedEventKind<T, CompositionEvent>
export type TypedSubmitEvent<T extends EventTarget> = TypedEventKind<T, SubmitEvent>
export type TypedTransitionEvent<T extends EventTarget> = TypedEventKind<T, TransitionEvent>
export type TypedAnimationEvent<T extends EventTarget> = TypedEventKind<T, AnimationEvent>
export type TypedProgressEvent<T extends EventTarget> = TypedEventKind<T, ProgressEvent>
