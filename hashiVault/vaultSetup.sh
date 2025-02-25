#!/bin/bash
set -e

# 1. Enable PKI and set max TTL
vault secrets enable pki
vault secrets tune -max-lease-ttl=87600h pki

# 2. Generate a root certificate for the PKI engine
vault write pki/root/generate/internal \
    common_name="ephemeral-root.local" \
    ttl="87600h"

# 3. Create a role for ephemeral certificates
vault write pki/roles/ephemeral-role \
    allowed_domains="ephemeral.local" \
    allow_subdomains=true \
    max_ttl="60s"

# 4. Write the provider policy to a temporary file
cat <<EOF > provider-policy.hcl
path "pki/sign/ephemeral-role" {
  capabilities = ["update"]
}
EOF

# 5. Load the provider policy
vault policy write provider-policy provider-policy.hcl

# 6. Create a provider token (adjust TTL as needed)
vault token create -policy="provider-policy" -ttl="1h"

echo "Vault is configured for ephemeral key signing."

