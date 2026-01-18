import { useTheme } from '@react-navigation/native';
import { IconSymbolName, IconSymbolProps, IconSymbol } from './ui/IconSymbol';
import { TouchableOpacity } from 'react-native';

type IconButtonProps = Partial<IconSymbolProps> & {
  name: IconSymbolName;
  onPress?: () => void;
  style?: object;
};

export const IconButton = ({ onPress, style, ...iconProps }: IconButtonProps) => {
  const themed = useTheme();

  const finalIconProps: IconSymbolProps = {
    ...iconProps,
    color: iconProps.color ?? themed.colors.text,
  };

  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <IconSymbol {...finalIconProps} />
    </TouchableOpacity>
  );
};
