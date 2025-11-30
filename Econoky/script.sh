#!/bin/bash
 
# Cambios de permisos 
sudo chown -R "$USER:$USER" .
 
# Copiar el contenido siguiente al archivo .env.local
cat <<EOF > .env.local
JWT_SECRET=estoesunsecreto
MONGODB_URI=mongodb://localhost:27017/econoky
STRIPE_SECRET_KEY=sk_test_...
 
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=econoky5@gmail.com
SMTP_PASS=nlkquzxmajrnrsmn
EMAIL_FROM="Econoky <Econoky5@gmail.com>"
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
 
# isntalar npm 
npm install 
npm run build
