"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon } from "lucide-react"

export const CLINIC_NAME_FALLBACKS: Record<string, string> = {
  'c1111111-1111-1111-1111-111111111111': 'New Friends Colony, New Delhi',
  'c2222222-2222-2222-2222-222222222222': 'Vasant Vihar, New Delhi',
  'c3333333-3333-3333-3333-333333333333': 'Gurugram – DLF Phase 1',
  'all': 'All 3 Clinic Branches',
  'centre_staff': 'Centre Staff (Clinical Desk & Billing)',
  'admin': 'Admin (Financials & Governance)',
  'percentage': 'Percentage (%)',
  'fixed': 'Fixed Amount (₹)',
}

interface SelectContextValue {
  value: string
  onValueChange?: (val: string) => void
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  labelsMap: Record<string, React.ReactNode>
  registerLabel: (val: string, label: React.ReactNode) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
  containerRef: React.RefObject<HTMLDivElement | null>
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

export interface SelectProps {
  value?: string | null
  defaultValue?: string
  onValueChange?: (value: string | null) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
  disabled?: boolean
}

function extractLabelsRecursively(children: React.ReactNode, map: Record<string, React.ReactNode>) {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return
    const props = child.props as any
    if (props) {
      if (props.value !== undefined && props.children !== undefined) {
        map[String(props.value)] = props.children
      }
      if (props.children) {
        extractLabelsRecursively(props.children, map)
      }
    }
  })
}

export function Select({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  open: controlledOpen,
  onOpenChange,
  children,
  disabled = false,
}: SelectProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)

  const isControlledValue = controlledValue !== undefined
  const value = isControlledValue ? (controlledValue ?? "") : uncontrolledValue

  const isControlledOpen = controlledOpen !== undefined
  const open = isControlledOpen ? (controlledOpen ?? false) : uncontrolledOpen

  const [labelsMap, setLabelsMap] = React.useState<Record<string, React.ReactNode>>(() => {
    const initialMap: Record<string, React.ReactNode> = { ...CLINIC_NAME_FALLBACKS }
    extractLabelsRecursively(children, initialMap)
    return initialMap
  })

  React.useEffect(() => {
    const nextMap: Record<string, React.ReactNode> = { ...CLINIC_NAME_FALLBACKS }
    extractLabelsRecursively(children, nextMap)
    setLabelsMap((prev) => ({ ...prev, ...nextMap }))
  }, [children])

  const setOpen = React.useCallback(
    (nextOpen: boolean | ((prev: boolean) => boolean)) => {
      const resolved = typeof nextOpen === "function" ? nextOpen(open) : nextOpen
      if (!isControlledOpen) setUncontrolledOpen(resolved)
      onOpenChange?.(resolved)
    },
    [isControlledOpen, onOpenChange, open]
  )

  const handleValueChange = React.useCallback(
    (newVal: string) => {
      if (!isControlledValue) setUncontrolledValue(newVal)
      onValueChange?.(newVal)
      setOpen(false)
    },
    [isControlledValue, onValueChange, setOpen]
  )

  const registerLabel = React.useCallback((val: string, label: React.ReactNode) => {
    setLabelsMap((prev) => {
      if (prev[val] === label) return prev
      return { ...prev, [val]: label }
    })
  }, [])

  React.useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, setOpen])

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        open: disabled ? false : open,
        setOpen,
        labelsMap,
        registerLabel,
        triggerRef,
        containerRef,
      }}
    >
      <div ref={containerRef} className="relative inline-block w-full text-left">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "default"
  children?: React.ReactNode
}

export function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectTriggerProps) {
  const ctx = React.useContext(SelectContext)
  if (!ctx) return null

  return (
    <button
      type="button"
      ref={ctx.triggerRef}
      aria-haspopup="listbox"
      aria-expanded={ctx.open}
      data-slot="select-trigger"
      data-size={size}
      onClick={() => ctx.setOpen((prev) => !prev)}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-white px-3 py-1.5 text-sm font-medium transition-colors outline-none select-none hover:bg-gray-50 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600/20 disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "h-8 text-xs" : "h-9 text-sm",
        className
      )}
      {...props}
    >
      <div className="flex-1 text-left truncate flex items-center gap-1.5 min-w-0">
        {children}
      </div>
      <ChevronDownIcon
        className={cn(
          "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150",
          ctx.open && "transform rotate-180"
        )}
      />
    </button>
  )
}

export interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string
  children?: React.ReactNode
}

export function SelectValue({
  className,
  placeholder = "Select...",
  children,
  ...props
}: SelectValueProps) {
  const ctx = React.useContext(SelectContext)
  if (!ctx) return null

  const resolved =
    children ||
    (ctx.value && ctx.labelsMap[ctx.value]) ||
    (ctx.value && CLINIC_NAME_FALLBACKS[ctx.value])

  const hasValue = Boolean(resolved)

  return (
    <span
      data-slot="select-value"
      className={cn(
        "block truncate text-left",
        !hasValue && "text-muted-foreground font-normal",
        className
      )}
      {...props}
    >
      {hasValue ? resolved : placeholder}
    </span>
  )
}

export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: "popper" | "item-aligned"
  children?: React.ReactNode
}

export function SelectContent({
  className,
  children,
  ...props
}: SelectContentProps) {
  const ctx = React.useContext(SelectContext)
  if (!ctx) return null

  if (!ctx.open) {
    return null
  }

  return (
    <div
      role="listbox"
      data-slot="select-content"
      className={cn(
        "absolute left-0 right-0 top-full mt-1 z-50 max-h-64 min-w-[8rem] overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 text-gray-900 shadow-lg ring-1 ring-black/5 animate-in fade-in-80 zoom-in-95",
        className
      )}
      {...props}
    >
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  disabled?: boolean
  children?: React.ReactNode
}

export function SelectItem({
  value,
  disabled = false,
  className,
  children,
  ...props
}: SelectItemProps) {
  const ctx = React.useContext(SelectContext)
  if (!ctx) return null

  const isSelected = ctx.value === value

  React.useEffect(() => {
    if (value && children) {
      ctx.registerLabel(value, children)
    }
  }, [value, children, ctx])

  return (
    <div
      role="option"
      aria-selected={isSelected}
      data-slot="select-item"
      data-value={value}
      onClick={(e) => {
        e.stopPropagation()
        if (!disabled) {
          ctx.onValueChange?.(value)
        }
      }}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center justify-between rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-medium outline-none transition-colors",
        isSelected
          ? "bg-blue-50 text-blue-700 font-semibold"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    >
      <span className="truncate flex-1">{children}</span>
      {isSelected && (
        <CheckIcon className="ml-2 h-4 w-4 shrink-0 text-blue-600" />
      )}
    </div>
  )
}

export function SelectGroup({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="select-group" className={cn("p-1", className)} {...props}>
      {children}
    </div>
  )
}

export function SelectLabel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="select-label"
      className={cn("px-2.5 py-1 text-xs font-semibold text-muted-foreground", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function SelectSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="select-separator"
      className={cn("-mx-1 my-1 h-px bg-gray-100", className)}
      {...props}
    />
  )
}

export function SelectScrollUpButton() {
  return null
}

export function SelectScrollDownButton() {
  return null
}
