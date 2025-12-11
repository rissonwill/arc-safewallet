import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, X } from "lucide-react";

interface VideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VideoModal({ open, onOpenChange }: VideoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl bg-background/95 backdrop-blur-xl border-[var(--color-neon-cyan)]/30">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold gradient-neon-text flex items-center gap-2">
            <Play className="h-5 w-5" />
            Arc SafeWallet Demo
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative aspect-video bg-black/50 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-[var(--color-neon-cyan)] to-[var(--color-neon-magenta)] flex items-center justify-center">
                <Play className="h-10 w-10 text-black ml-1" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Demo em Breve</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Estamos preparando um vídeo demonstrativo completo das funcionalidades do Arc SafeWallet. 
                Enquanto isso, explore o dashboard para conhecer todas as ferramentas disponíveis.
              </p>
              <Button 
                className="mt-6 bg-gradient-to-r from-[var(--color-neon-cyan)] to-[var(--color-neon-magenta)] text-black font-semibold"
                onClick={() => onOpenChange(false)}
              >
                Explorar Dashboard
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="p-4 rounded-lg bg-card/50 border border-border">
            <h4 className="font-semibold text-sm mb-1 text-[var(--color-neon-cyan)]">Editor Solidity</h4>
            <p className="text-xs text-muted-foreground">Escreva e compile contratos inteligentes</p>
          </div>
          <div className="p-4 rounded-lg bg-card/50 border border-border">
            <h4 className="font-semibold text-sm mb-1 text-[var(--color-neon-magenta)]">Deploy Multi-Chain</h4>
            <p className="text-xs text-muted-foreground">Deploy em múltiplas redes simultaneamente</p>
          </div>
          <div className="p-4 rounded-lg bg-card/50 border border-border">
            <h4 className="font-semibold text-sm mb-1 text-[var(--color-neon-green)]">Scanner de Segurança</h4>
            <p className="text-xs text-muted-foreground">Detecte vulnerabilidades automaticamente</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
