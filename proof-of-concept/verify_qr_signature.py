import base64
import json
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.exceptions import InvalidSignature


def canonical_json_bytes(obj):
    """Stable canonical encoding for offline signature verification."""
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def verify_fayda_qr_token(token_payload_str, public_key_pem):
    """
    Verifies an offline Fayda/MOSIP time-signed QR token using a pre-loaded local Public Key.
    No network connection required.

    The important detail is that the signature is computed over the original unsigned payload object,
    excluding only the signature field. Re-serializing with a consistent canonical encoding preserves
    the exact signing semantics and avoids fragile representation drift.
    """
    try:
        data = json.loads(token_payload_str)
        if "signature" not in data:
            raise ValueError("Token is missing a signature field.")

        signature = base64.b64decode(data["signature"])

        # Build a canonical unsigned payload from the original token body.
        unsigned_payload = {key: value for key, value in data.items() if key != "signature"}
        message = canonical_json_bytes(unsigned_payload)

        # Load local trusted public key
        public_key = serialization.load_pem_public_key(public_key_pem.encode("utf-8"))

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
