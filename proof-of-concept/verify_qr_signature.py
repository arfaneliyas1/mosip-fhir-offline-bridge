import base64
import json
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.exceptions import InvalidSignature

def verify_fayda_qr_token(token_payload_str, public_key_pem):
    """
    Verifies an offline Fayda/MOSIP time-signed QR token using a pre-loaded local Public Key.
    No network connection required.
    """
    try:
        data = json.loads(token_payload_str)
        signature = base64.b64decode(data["signature"])
        
        # Reconstruct the unsigned payload representation
        claims_to_verify = {
            "iss": data["iss"],
            "sub": data["sub"],
            "iat": data["iat"],
            "exp": data["exp"],
            "identity_claims": data["identity_claims"]
        }
        message = json.dumps(claims_to_verify, sort_keys=True).encode('utf-8')
        
        # Load local trusted public key
        public_key = serialization.load_pem_public_key(public_key_pem.encode('utf-8'))
        
        # Verify ECDSA signature
        public_key.verify(
            signature,
            message,
            ec.ECDSA(hashes.SHA256())
        )
        print("SUCCESS: Offline cryptographic signature verified. Identity is authentic.")
        return True
    except InvalidSignature:
        print("ERROR: Signature mismatch! Token may have been altered.")
        return False
    except Exception as e:
        print(f"ERROR: Verification failed due to exception: {e}")
        return False
