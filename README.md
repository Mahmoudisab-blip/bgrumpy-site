# B.Grumpy Tattoo

Site Next.js de B.Grumpy Tattoo, publié sur Vercel.

## Développement

```bash
npm run dev
```

Puis ouvrir `http://localhost:3000`.

## Déploiement

```bash
npm run build
npx vercel --prod --yes
```

## Emails de réinitialisation de mot de passe

La solution gratuite retenue est Resend :

- plan gratuit à 0 $ ;
- 3 000 emails par mois ;
- 100 emails par jour ;
- suffisant pour les mots de passe oubliés.

Le code est déjà prêt : `src/app/api/client/password-reset/request/route.ts` envoie l'email si `RESEND_API_KEY` est configurée.

### Configuration gratuite

1. Créer un compte gratuit sur `https://resend.com`.
2. Ajouter et vérifier le domaine dans Resend.
3. Créer une API key Resend.
4. Ajouter ces variables dans Vercel, dans le projet `bgrumpy-site` :

```env
RESEND_API_KEY=re_xxxxxxxxx
DEVIS_MAIL_FROM="B.Grumpy Tattoo <contact@ton-domaine.fr>"
```

5. Redéployer le site.

Tant que `RESEND_API_KEY` n'est pas configurée, le site garde le reset sécurisé en base, mais ne peut pas envoyer l'email au client.
