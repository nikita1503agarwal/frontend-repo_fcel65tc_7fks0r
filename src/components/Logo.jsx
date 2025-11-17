import { PawPrint } from 'lucide-react'

export default function Logo({ className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="size-9 rounded-xl bg-gradient-to-br from-sky-700 to-teal-500 grid place-items-center shadow-lg shadow-sky-900/20">
          <PawPrint className="text-amber-300" size={20} />
        </div>
      </div>
      <div className="leading-tight">
        <div className="text-sm tracking-widest text-amber-300">training</div>
        <div className="-mt-1 text-xl font-extrabold bg-gradient-to-r from-sky-300 to-teal-200 text-transparent bg-clip-text">PETS</div>
      </div>
    </div>
  )
}
