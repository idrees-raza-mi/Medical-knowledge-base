-- Create a function to make the first user an admin
CREATE OR REPLACE FUNCTION public.handle_new_user_admin()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Check if this is the first user
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- If this is the first user, make them an admin
  IF user_count = 0 THEN
    -- Update the newly created profile to admin
    UPDATE public.profiles 
    SET role = 'admin'::app_role 
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to run after profile creation
CREATE TRIGGER on_profile_created_check_admin
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_admin();