# ============================================
# CONFIGURAR GITHUB SECRETS - Anita Festival
# ============================================
# 
# PASOS:
#
# 1. Crear GitHub PAT:
#    https://github.com/settings/tokens/new
#    Permisos: repo, workflow
#
# 2. Login y configurar secrets:
#
#    gh auth login --token TU_GITHUB_PAT
#    
#    gh secret set VERCEL_TOKEN --body  TU_VERCEL_TOKEN
#    gh secret set VERCEL_ORG_ID --body team_MEW8F9FRa5t1GScDAeCQFn5A
#    gh secret set VERCEL_PROJECT_ID --body prj_5AhjbJo7jrbdS7EW2LPr8RCFCCq1
#
# 3. Verificar en GitHub:
#    https://github.com/webonlineinfo28-lgtm/anita-web/settings/secrets/actions

## VALORES NECESARIOS:

VERCEL_TOKEN = Tu token de Vercel (ya lo tienes)
VERCEL_ORG_ID = team_MEW8F9FRa5t1GScDAeCQFn5A
VERCEL_PROJECT_ID = prj_5AhjbJo7jrbdS7EW2LPr8RCFCCq1
