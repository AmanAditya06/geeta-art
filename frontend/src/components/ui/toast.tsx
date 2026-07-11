import { Toaster as SonnerToaster } from "sonner"

function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#FFF8F0",
          color: "#2C1810",
          border: "1px solid #E8D5C4",
        },
      }}
    />
  )
}

export { Toaster }
