import { useState } from "react";

const useDialogActions = (initialState = false) => {
  const [open, setOpen] = useState(initialState);

  const openDialog = () => setOpen(true);
  const closeDialog = () => setOpen(false);

  return { open, openDialog, closeDialog };
};

export default useDialogActions;
