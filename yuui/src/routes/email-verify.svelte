<script lang="ts" type="module">
</script>

<svelte:head>
	<title>Verify Email</title>
</svelte:head>

<main>
	<p>
		Do you want to verify the email below?    
		(If you do not, just close this page.)    
	</p>
	<form>
	</form>
</main>
        <form action="{{ url_for('api_v1.email_verify') }}" method="POST">    
            <label>    
                Email    
                <input type="email" value="{{ email.email }}" readonly>    
            </label>    
            <input type="hidden" name="email_id" value="{{ email_id }}" />    
            <input type="hidden" name="token" value="{{ token }}" />    
            <input type="submit" value="Verify" />    
        </form>    
