import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useColorScheme } from "@mui/material/styles";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import BrightnessAutoIcon from "@mui/icons-material/BrightnessAuto";

const nextMode = { light: "dark", dark: "system", system: "light" } as const;

const modeDetails = {
  light: { label: "Light mode", icon: <LightModeIcon /> },
  dark: { label: "Dark mode", icon: <DarkModeIcon /> },
  system: { label: "System mode", icon: <BrightnessAutoIcon /> },
};

export default function ThemeToggle() {
  const { mode, setMode } = useColorScheme();
  const current = mode ?? "system";
  const { label, icon } = modeDetails[current];

  return (
    <Tooltip title={`${label} (click to switch)`}>
      <IconButton color="inherit" aria-label={label} onClick={() => setMode(nextMode[current])}>
        {icon}
      </IconButton>
    </Tooltip>
  );
}
