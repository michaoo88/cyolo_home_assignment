import sys
import json
import datetime
from flask import Flask, request, current_app, Response
from flask_cors import CORS, cross_origin


def token_validation(token):
    try:
        if int(token) > int(datetime.datetime.utcnow().strftime('%s')):
            return True
        return False
    except Exception as _exc:
        print(_exc.args[0], file=sys.stderr)
        return False


def auth(username, password):
    try:
        token = ""
        validation_period = 120

        users = {
            "user": "Password1234",
            "User": "Password4321",
            "USER": "Password0000"
        }

        if username in users and users[username] == password:
            token = int(datetime.datetime.utcnow().strftime('%s')) + validation_period
        else:
            token = ""
        return token

    except Exception as _exc:
        print(_exc.args[0], file=sys.stderr)
        return ""


app = Flask(__name__)
CORS(app)


@app.route("/api-1", methods=["GET"])
@cross_origin(origins='*', supports_credentials=True)
def api1():
    try:
        result = {"response": "success"}
        return Response(
            json.dumps(result),
            status=200,
        )
    except Exception as _exc:
        result = {"response": "Failed - " + _exc.args[0]}
        return Response(
            json.dumps(result),
            status=501,
        )


@app.route("/api-2", methods=["POST"])
@cross_origin(origins='*', supports_credentials=True)
def api2():
    try:
        http_code = 501
        token = ""
        my_data = json.loads(request.data)
        print(my_data, file=sys.stderr)

        username, password = "", ""

        if "username" in my_data and "password" in my_data:
            username = my_data["username"]
            password = my_data["password"]

        token = auth(username, password)

        if token:
            result = {"token": token}
            http_code = 200
        else:
            result = {"response": "unauthorized"}
            http_code = 401

        return Response(
            json.dumps(result),
            status=http_code,
        )

    except Exception as _exc:
        print(_exc.args[0], file=sys.stderr)
        result = {"response": "Failed - " + _exc.args[0]}
        return Response(
            json.dumps(result),
            status=501,
        )


@app.route("/api-3", methods=["POST"])
@cross_origin(origins='*', supports_credentials=True)
def api3():
    try:
        http_code = 501
        total = 0
        my_token = request.headers.get('authorization')

        if not token_validation(my_token):
            result = {"response": "Token not valid"}
            http_code = 401
        else:
            my_data = json.loads(request.data)
            print(my_data, file=sys.stderr)

            num_a = 0
            num_b = 0

            if "num_a" in my_data and "num_b" in my_data:
                num_a = my_data["num_a"]
                num_b = my_data["num_b"]
                total = int(num_a) + int(num_b)
                result = {"total": total}
                http_code = 200
            else:
                result = {"response": "wrong input"}
                http_code = 404

        return Response(
            json.dumps(result),
            status=http_code,
        )

    except Exception as _exc:
        print(_exc.args[0], file=sys.stderr)
        result = {"response": "Failed - " + _exc.args[0]}
        return Response(
            json.dumps(result),
            status=501,
        )


if __name__ == '__main__':
    app.run(host="127.0.0.1", port=8080, debug=True)
