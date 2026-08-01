"use client";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title = "Konfirmasi Simpan Data",
  message = "Apakah Anda yakin ingin menyimpan perubahan data ini?",
  confirmText = "Ya, Simpan Perubahan",
  cancelText = "Batal",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 border border-[color:var(--line)] animate-in fade-in zoom-in duration-150">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
            ❓
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-[color:var(--forest-deep)]">
              {title}
            </h3>
            <p className="text-xs text-[color:var(--ink-soft)]">
              Harap konfirmasi tindakan Anda.
            </p>
          </div>
        </div>

        <p className="text-sm text-[color:var(--ink)] leading-relaxed bg-[#fbfaf5] p-3 rounded-lg border border-[color:var(--line)]">
          {message}
        </p>

        <div className="flex justify-end gap-3 mt-2 pt-3 border-t border-[color:var(--line)]">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[color:var(--forest)] hover:bg-[#1e3019] text-white transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Menyimpan...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
