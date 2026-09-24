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
DEVIS_MAIL_FROM="B.Grumpy Tattoo <info@bgrumpytattoo.fr>"
```

5. Dans le DNS de `bgrumpytattoo.fr`, ajouter exactement les enregistrements SPF/DKIM affichés par Resend pour le domaine vérifié.
6. Garder un seul enregistrement SPF à la racine du domaine : supprimer tout ancien SPF d’un fournisseur qui n’est plus utilisé, puis fusionner les mécanismes si un autre service d’envoi doit rester actif.
7. Ajouter ou conserver un DMARC sur `_dmarc.bgrumpytattoo.fr`, par exemple `v=DMARC1; p=none` au démarrage, puis renforcer la politique après vérification.
8. Redéployer le site après validation du domaine dans Resend.

Tant que `RESEND_API_KEY` n'est pas configurée, le site garde le reset sécurisé en base, mais ne peut pas envoyer l'email au client.
