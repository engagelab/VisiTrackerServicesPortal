class Iobserve < Sinatra::Application
  ######################## Survey ##################################
  post '/space/:space_id/survey' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      begin
        space = Space.find(params[:space_id])
      end

      @survey = nil;

      unless space.nil? then
        data = JSON.parse request.body.read
        unless data.nil? then
          unless data['label'].nil? then
            @survey = Survey.create(:created_on => Time.now.to_i, :label => data['label']);
          else
            @survey = Survey.create(:created_on => Time.now.to_i)
          end
        else
          @survey = Survey.create(:created_on => Time.now.to_i)
        end

        space.surveys << @survey
        space.save
        return @survey.to_json
      else
        status 404
        return {"message" => "Space not found"}.to_json
      end
    else
      status 401
    end
  end

  ##### Create a new question for this survey #####
  post '/survey/:survey_id/question' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      begin
        survey = Survey.find(params[:survey_id])
      end

      unless survey.nil? then
        data = JSON.parse request.body.read

        unless data.nil? then

          unless data['label'].nil? && data['type'].nil? then

            unless data['options'].nil? then
              question = Question.create(:created_on => Time.now.to_i, :label => data['label'], :type => data['type'], :options => data['options']);
            else
              question = Question.create(:created_on => Time.now.to_i, :label => data['label'], :type => data['type']);
            end

            survey.questions << question
            survey.save
            return question.to_json;
          end

        end
      else
        status 404
        return {"message" => "Survey not found"}.to_json
      end
    else
      status 401
    end
  end

  ##### Post an answer for this survey #####
  post '/survey/:survey_id/answer' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      begin
        survey = Survey.find(params[:survey_id])
      end

      unless survey.nil? then
        data = JSON.parse request.body.read

        unless data.nil? then
          unless data['answers'].nil? then
            survey.answers << data['answers']
            survey.update_attributes(:locked => true)
            survey.save
            status 200
            return survey.to_json
          end
        end
      else
        status 404
        return {"message" => "Survey not found"}.to_json
      end
    else
      status 401
    end
  end


  ### list all surveys
  get '/survey' do
    if authorized?
      content_type :json
      @survey = Survey.all()
      return @survey.to_json
    else
      status 401
    end
  end


  ### list all surveys by space id
  get '/space/:space_id/survey' do
    if authorized?
      content_type :json
      space = Space.find(params[:space_id])
      return space.surveys.to_json
    else
      status 401
    end
  end

  ###  get a survey by id
  get '/survey/:survey_id' do
    if authorized?
      content_type :json
      survey = Survey.find(params[:survey_id])
      return survey.to_json
    else
      status 401
    end
  end

  ### update survey's properties
  put '/survey' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json;
      data = JSON.parse request.body.read

      unless data.nil? or data['_id'].nil? then
        status 200

        survey = Survey.find(data['_id'])

        unless data['label'].nil?
          survey.update_attributes(:label => data['label'])
        end

        unless data['locked'].nil?
          survey.update_attributes(:locked => true)
        end

        return survey.to_json
      else
        status 404
        return {"message" => "Provide a new label"}.to_json
      end
    else
      status 401
    end
  end


  ### delete a question by id
  delete '/question/:question_id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      question = Question.find(params[:question_id])

      if question.nil? then
        status 404
      else
        if question.destroy then
          status 200
          return {"message" => "Question deleted"}.to_json
        else
          status 500
        end
      end
    else
      status 401
    end
  end


  ### delete a survey by id
  delete '/survey/:survey_id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      survey = Survey.find(params[:survey_id])

      if survey.nil? then
        status 404
      else
        unless survey.questions.nil? then
          survey.questions.each do|quest|
            question = Question.find(quest._id)
            question.destroy
          end
        end

        if survey.destroy then
          status 200
          return {"message" => "Survey deleted"}.to_json
        else
          status 500
        end
      end
    else
      status 401
    end
  end
end
