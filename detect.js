{% extends "base.html" %}
{% block title %}Detect — Live Threat Detection{% endblock %}

{% block content %}
<h2 class="page-title">Live Attack Detection</h2>

<div class="panel" id="detectPanel">
  <div class="panel-title accent">Detection Setup</div>

  <div id="noModelWarning" class="warning-box">
    No trained model found in this session. Please
    <a href="/train" class="accent">train a model first</a>, then return here.
  </div>

  <div id="detectReady" style="display:none">
    <div class="model-info" id="modelInfo"></div>

    <div class="detect-options">
      <div class="detect-option" id="uploadOption">
        <div class="option-title">Upload New Dataset for Detection</div>
        <div class="upload-zone small" id="detectDropZone">
          <input type="file" id="detectFileInput" accept=".csv" style="display:none" onchange="handleDetectFile(this.files[0])">
          <div class="upload-sub">Drop CSV file or <span class="accent" style="cursor:pointer" onclick="document.getElementById('detectFileInput').click()">click to browse</span></div>
        </div>
        <div id="detectFileStatus" class="file-status hidden"></div>
        <button class="btn btn-primary" id="detectUploadBtn" style="margin-top:10px;display:none" onclick="runDetection('upload')">
          &#9654; Detect Threats
        </button>
      </div>

      <div class="or-divider"><span>or</span></div>

      <button class="btn btn-outline" style="width:100%" onclick="runDetection('demo')">
        Run Demo Detection (50 synthetic packets)
      </button>
    </div>
  </div>
</div>

<!-- DETECTION RESULTS — matches Fig 7.3 Live Attack Detection Dashboard -->
<div class="panel hidden" id="detectResultsPanel">
  <div class="results-header">
    <div class="panel-title accent">Recent Network Flows</div>
    <div class="detect-stats" id="detectStats"></div>
  </div>

  <div style="overflow-x:auto">
    <table class="flows-table" id="flowsTable">
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Source IP</th>
          <th>Dest IP</th>
          <th>Protocol</th>
          <th>Prediction</th>
          <th>Confidence</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody id="flowsBody"></tbody>
    </table>
  </div>

  <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">
    <button class="btn btn-outline" onclick="downloadResults()">Download CSV</button>
    <button class="btn btn-outline" onclick="document.getElementById('detectResultsPanel').classList.add('hidden')">Clear</button>
    <a href="/dashboard" class="btn btn-primary">View Dashboard</a>
  </div>
</div>

{% endblock %}

{% block scripts %}
<script src="{{ url_for('static', filename='js/detect.js') }}"></script>
{% endblock %}
