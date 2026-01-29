-- 1. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.app_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- CHAT, PROJECT_UPDATE, TASK_ASSIGNED
    link_id INTEGER, -- project_id
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE app_notifications;

-- 2. Function for Chat Notifications
CREATE OR REPLACE FUNCTION public.notify_on_new_message()
RETURNS TRIGGER AS $$
DECLARE
    team_member RECORD;
    sender_name TEXT;
    project_name TEXT;
BEGIN
    -- Get sender name
    SELECT name INTO sender_name FROM public.users WHERE id = NEW.user_id;
    -- Get project name
    SELECT name INTO project_name FROM public.projects WHERE id = NEW.project_id;

    -- Notify Team Members
    FOR team_member IN 
        SELECT user_id FROM public.project_team_members WHERE project_id = NEW.project_id AND user_id != NEW.user_id
    LOOP
        INSERT INTO public.app_notifications (user_id, title, message, type, link_id)
        VALUES (team_member.user_id, 'Conversación - ' || project_name, sender_name || ': ' || LEFT(NEW.content, 50), 'CHAT', NEW.project_id);
    END LOOP;

    -- Notify Leaders
    FOR team_member IN 
        SELECT leader_id FROM public.project_area_config WHERE project_id = NEW.project_id AND leader_id != NEW.user_id
    LOOP
        IF NOT EXISTS (SELECT 1 FROM public.app_notifications WHERE user_id = team_member.leader_id AND link_id = NEW.project_id AND created_at > NOW() - INTERVAL '1 second') THEN
            INSERT INTO public.app_notifications (user_id, title, message, type, link_id)
            VALUES (team_member.leader_id, 'Conversación - ' || project_name, sender_name || ': ' || LEFT(NEW.content, 50), 'CHAT', NEW.project_id);
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for New Message
DROP TRIGGER IF EXISTS tr_notify_chat ON public.project_messages;
CREATE TRIGGER tr_notify_chat
AFTER INSERT ON public.project_messages
FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_message();

-- 3. Function for Project Status Change
CREATE OR REPLACE FUNCTION public.notify_on_project_update()
RETURNS TRIGGER AS $$
DECLARE
    team_member RECORD;
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Notify Team Members
        FOR team_member IN 
            SELECT user_id FROM public.project_team_members WHERE project_id = NEW.id
        LOOP
            INSERT INTO public.app_notifications (user_id, title, message, type, link_id)
            VALUES (team_member.user_id, 'Proyecto Actualizado', 'El proyecto "' || NEW.name || '" ahora está ' || NEW.status, 'PROJECT_UPDATE', NEW.id);
        END LOOP;
        
        -- Notify Leaders
        FOR team_member IN 
            SELECT leader_id FROM public.project_area_config WHERE project_id = NEW.id
        LOOP
             IF NOT EXISTS (SELECT 1 FROM public.app_notifications WHERE user_id = team_member.leader_id AND link_id = NEW.id AND created_at > NOW() - INTERVAL '1 second') THEN
                INSERT INTO public.app_notifications (user_id, title, message, type, link_id)
                VALUES (team_member.leader_id, 'Proyecto Actualizado', 'El proyecto "' || NEW.name || '" ahora está ' || NEW.status, 'PROJECT_UPDATE', NEW.id);
             END IF;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Project Status
DROP TRIGGER IF EXISTS tr_notify_project ON public.projects;
CREATE TRIGGER tr_notify_project
AFTER UPDATE OF status ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.notify_on_project_update();

-- 4. Function for Task Assignment Notifications
CREATE OR REPLACE FUNCTION public.notify_on_task_assignment()
RETURNS TRIGGER AS $$
DECLARE
    project_name TEXT;
BEGIN
    -- Get project name
    SELECT name INTO project_name FROM public.projects WHERE id = NEW.project_id;

    -- Notify only if there is a responsible user and it's not the one who created it (though here we don't track creator easily)
    IF NEW.responsible_id IS NOT NULL THEN
        -- On Insert or if Responsible changed
        IF (TG_OP = 'INSERT') OR (NEW.responsible_id IS DISTINCT FROM OLD.responsible_id) THEN
            INSERT INTO public.app_notifications (user_id, title, message, type, link_id)
            VALUES (NEW.responsible_id, 'Nueva Tarea Asignada', 'Se te ha asignado la tarea: ' || NEW.description || ' en el proyecto ' || project_name, 'TASK_ASSIGNED', NEW.project_id);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Task Assignment
DROP TRIGGER IF EXISTS tr_notify_task ON public.activities;
CREATE TRIGGER tr_notify_task
AFTER INSERT OR UPDATE OF responsible_id ON public.activities
FOR EACH ROW EXECUTE FUNCTION public.notify_on_task_assignment();
