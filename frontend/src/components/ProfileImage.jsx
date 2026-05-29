import { useState } from "react";
import { UserIcon } from "lucide-react";
import { getImageUrl } from "../lib/utils";
import { cn } from "../lib/utils";

const ProfileImage = ({ src, alt = "Profile", className, iconClassName }) => {
  const imageUrl = getImageUrl(src);
  const [hasError, setHasError] = useState(false);

  if (!imageUrl || hasError) {
    return (
      <div className={cn("flex items-center justify-center bg-base-300 text-base-content/50", className)}>
        <UserIcon className={cn("size-1/2", iconClassName)} />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={cn("object-cover", className)}
      onError={() => setHasError(true)}
    />
  );
};

export default ProfileImage;
