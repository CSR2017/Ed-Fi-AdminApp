INSERT INTO public.oidc(issuer, "clientId", "clientSecret", scope)
SELECT 'https://localhost/auth/realms/edfi', 'edfiadminapp', 'big-secret-123', ''
WHERE NOT EXISTS (
	SELECT 1 FROM public.oidc WHERE "clientId" = 'edfiadminapp'
);

INSERT INTO public.oidc(issuer, "clientId", "clientSecret", scope)
SELECT 'https://localhost/auth/realms/edfi', 'edfiadminapp-dev', 'big-secret-123', ''
WHERE NOT EXISTS (
	SELECT 1 FROM public.oidc WHERE "clientId" = 'edfiadminapp-dev'
);

SELECT * FROM public.oidc;