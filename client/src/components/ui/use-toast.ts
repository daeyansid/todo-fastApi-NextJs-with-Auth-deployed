import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast"
import { useToast as useNextToast } from "@/hooks/use-toast"

type ToastActionType = ToastProps & { title?: string; description?: string; action?: ToastActionElement }

export function useToast() {
    const { toast } = useNextToast()

    return {
        toast: ({ ...props }: ToastActionType) => toast(props),
    }
}
