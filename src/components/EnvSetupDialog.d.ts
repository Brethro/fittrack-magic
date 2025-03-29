
import { Dispatch, SetStateAction } from 'react';

export interface EnvSetupDialogProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  onConfigSaved: () => void;
}
