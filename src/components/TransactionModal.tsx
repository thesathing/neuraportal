import React from 'react'
import { X, Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { NEURA_TESTNET } from '../config/constants'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  status: 'pending' | 'success' | 'error'
  title: string
  message: string
  txHash?: string
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  status,
  title,
  message,
  txHash,
}) => {
  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-surface border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center">
          {status === 'pending' && (
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-error" />
            </div>
          )}

          <p className="text-gray-300 mb-4">{message}</p>

          {txHash && (
            <a
              href={`${NEURA_TESTNET.blockExplorer}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              View on Explorer
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {status !== 'pending' && (
          <div className="p-4 border-t border-border">
            <button onClick={onClose} className="btn-primary w-full">
              Close
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default TransactionModal
