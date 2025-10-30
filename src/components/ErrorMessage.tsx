interface ErrorMessageProps {
  message: string
  onClose: () => void
}

export function ErrorMessage({ message, onClose }: ErrorMessageProps) {
  return (
    <div className="error-message">
      <span>{message}</span>
      <button onClick={onClose} className="close-button">
        ×
      </button>
    </div>
  )
}
